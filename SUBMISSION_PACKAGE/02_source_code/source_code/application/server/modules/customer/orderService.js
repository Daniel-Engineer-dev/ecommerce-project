const pool = require('../../config/db');
const { sendEmail } = require('../../utils/sendEmail');

const ORDER_STATUS = {
    PENDING: 'Pending',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed',
    EXPIRED: 'Expired',
};

class OrderService {
    async validateCart(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Cart is empty.');
        }

        const normalized = this.normalizeItems(items);

        if (normalized.some((item) => !Number.isInteger(item.voucher_id) || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
            throw new Error('Cart contains invalid voucher quantities.');
        }

        const voucherIds = [...new Set(normalized.map((item) => item.voucher_id))];
        const { rows } = await pool.query(
            `
                SELECT voucher_id, title, sale_price, quantity_stock, status, start_date, expiry_date
                FROM Vouchers
                WHERE voucher_id = ANY($1::int[])
            `,
            [voucherIds]
        );

        const voucherMap = new Map(rows.map((row) => [Number(row.voucher_id), row]));
        const validatedItems = [];
        const errors = [];
        let totalAmount = 0;
        const now = new Date();

        for (const item of normalized) {
            const voucher = voucherMap.get(item.voucher_id);
            if (!voucher) {
                errors.push({ voucher_id: item.voucher_id, message: 'Voucher does not exist.' });
                continue;
            }

            const valid = voucher.status === 'Approved'
                && new Date(voucher.start_date) <= now
                && new Date(voucher.expiry_date) > now
                && Number(voucher.quantity_stock) >= item.quantity;

            if (!valid) {
                errors.push({
                    voucher_id: item.voucher_id,
                    title: voucher.title,
                    quantity_stock: Number(voucher.quantity_stock),
                    status: voucher.status,
                    message: 'Voucher is not available for checkout.',
                });
                continue;
            }

            const lineTotal = Number(voucher.sale_price) * item.quantity;
            totalAmount += lineTotal;
            validatedItems.push({
                voucher_id: item.voucher_id,
                quantity: item.quantity,
                title: voucher.title,
                sale_price: voucher.sale_price,
                quantity_stock: Number(voucher.quantity_stock),
                line_total: lineTotal,
            });
        }

        return { valid: errors.length === 0, totalAmount, items: validatedItems, errors };
    }

    async createOrder(customerId, shippingInfo, items, paymentMethod) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const normalizedItems = this.normalizeItems(items);
            const { valid, errors, totalAmount } = await this.validateCartWithClient(client, normalizedItems);
            if (!valid) {
                throw new Error(errors[0]?.message || 'Cart contains unavailable vouchers.');
            }

            const {
                name,
                phone,
                email,
                address,
                isGift = false,
                recipientName = null,
                recipientPhone = null,
                recipientEmail = null,
                giftMessage = null,
            } = shippingInfo;
            const orderRes = await client.query(
                `
                    INSERT INTO Orders (
                        customer_id, total_amount, status, payment_method,
                        shipping_name, shipping_phone, shipping_email, shipping_address,
                        is_gift, gift_recipient_name, gift_recipient_phone,
                        gift_recipient_email, gift_message
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING order_id
                `,
                [
                    customerId,
                    totalAmount,
                    ORDER_STATUS.PENDING,
                    paymentMethod,
                    name,
                    phone,
                    email,
                    address || null,
                    Boolean(isGift),
                    isGift ? recipientName : null,
                    isGift ? recipientPhone : null,
                    isGift ? recipientEmail : null,
                    isGift ? giftMessage : null,
                ]
            );

            const orderId = orderRes.rows[0].order_id;
            for (const item of normalizedItems) {
                const voucherRes = await client.query('SELECT sale_price FROM Vouchers WHERE voucher_id = $1', [item.voucher_id]);
                await client.query(
                    `
                        INSERT INTO Order_Items (order_id, voucher_id, quantity, price_at_purchase)
                        VALUES ($1, $2, $3, $4)
                    `,
                    [orderId, item.voucher_id, item.quantity, voucherRes.rows[0].sale_price]
                );

                // Giảm số lượng tồn kho của voucher
                await client.query(
                    `
                        UPDATE Vouchers
                        SET quantity_stock = GREATEST(0, quantity_stock - $1)
                        WHERE voucher_id = $2
                    `,
                    [item.quantity, item.voucher_id]
                );
            }

            await client.query('COMMIT');
            return { orderId, totalAmount };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async validateCartWithClient(client, items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Cart is empty.');
        }

        const normalized = this.normalizeItems(items);
        const errors = [];
        let totalAmount = 0;

        for (const item of normalized) {
            if (!Number.isInteger(item.voucher_id) || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                errors.push({ voucher_id: item.voucher_id, message: 'Invalid voucher quantity.' });
                continue;
            }

            const voucherRes = await client.query(
                `
                    SELECT voucher_id, title, sale_price, quantity_stock, status, start_date, expiry_date
                    FROM Vouchers
                    WHERE voucher_id = $1
                    FOR UPDATE
                `,
                [item.voucher_id]
            );

            if (voucherRes.rows.length === 0) {
                errors.push({ voucher_id: item.voucher_id, message: 'Voucher does not exist.' });
                continue;
            }

            const voucher = voucherRes.rows[0];
            const isAvailable = voucher.status === 'Approved'
                && new Date(voucher.start_date) <= new Date()
                && new Date(voucher.expiry_date) > new Date()
                && Number(voucher.quantity_stock) >= item.quantity;

            if (!isAvailable) {
                errors.push({
                    voucher_id: item.voucher_id,
                    title: voucher.title,
                    quantity_stock: Number(voucher.quantity_stock),
                    message: `Voucher "${voucher.title}" is unavailable or out of stock.`,
                });
                continue;
            }

            totalAmount += Number(voucher.sale_price) * item.quantity;
        }

        return { valid: errors.length === 0, totalAmount, errors };
    }

    normalizeItems(items) {
        const merged = new Map();
        for (const item of items) {
            const voucherId = Number(item.voucher_id);
            const quantity = Number(item.quantity);
            if (!merged.has(voucherId)) {
                merged.set(voucherId, { voucher_id: voucherId, quantity: 0 });
            }
            merged.get(voucherId).quantity += quantity;
        }
        return [...merged.values()];
    }

    async assertCustomerOwnsOrder(orderId, customerId) {
        const { rows } = await pool.query(
            'SELECT order_id, status FROM Orders WHERE order_id = $1 AND customer_id = $2',
            [orderId, customerId]
        );
        if (rows.length === 0) {
            const error = new Error('Order not found.');
            error.statusCode = 404;
            throw error;
        }
        return rows[0];
    }

    async completeOrder(orderId, transactionRef, customerId = null, paymentProof = null) {
        const client = await pool.connect();
        let committed = false;
        try {
            await client.query('BEGIN');

            const params = customerId ? [orderId, customerId] : [orderId];
            const orderQuery = customerId
                ? 'SELECT status, total_amount, payment_method, transaction_reference FROM Orders WHERE order_id = $1 AND customer_id = $2 FOR UPDATE'
                : 'SELECT status, total_amount, payment_method, transaction_reference FROM Orders WHERE order_id = $1 FOR UPDATE';
            const orderRes = await client.query(orderQuery, params);

            if (orderRes.rows.length === 0) {
                const error = new Error('Order not found.');
                error.statusCode = 404;
                throw error;
            }

            const order = orderRes.rows[0];
            if (paymentProof && !transactionRef) {
                throw new Error('Verified payment transaction reference is required.');
            }
            if (paymentProof?.method && order.payment_method !== paymentProof.method) {
                throw new Error('Payment method does not match the order.');
            }
            const amountTolerance = Number(paymentProof?.amountTolerance || 0);
            if (paymentProof) {
                const paidAmount = Number(paymentProof.amount);
                if (!Number.isFinite(paidAmount)
                    || Math.abs(Number(order.total_amount) - paidAmount) > amountTolerance) {
                    throw new Error('Payment amount does not match the order total.');
                }
            }
            if (order.status === ORDER_STATUS.PAID) {
                if (transactionRef && order.transaction_reference !== transactionRef) {
                    throw new Error('Order was already paid with a different transaction.');
                }
                await client.query('COMMIT');
                committed = true;
                return true;
            }
            if (order.status !== ORDER_STATUS.PENDING) {
                throw new Error(`Order cannot be completed from status ${order.status}.`);
            }

            await client.query(
                `UPDATE Orders SET status = $1, transaction_reference = $2 WHERE order_id = $3`,
                [ORDER_STATUS.PAID, transactionRef || 'SYSTEM_AUTO', orderId]
            );

            const itemsRes = await client.query(
                `
                    SELECT oi.order_item_id, oi.quantity, v.expiry_date,
                        COUNT(ev.evoucher_id)::int AS existing_count
                    FROM Order_Items oi
                    JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                    LEFT JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
                    WHERE oi.order_id = $1
                    GROUP BY oi.order_item_id, oi.quantity, v.expiry_date
                    ORDER BY oi.order_item_id
                `,
                [orderId]
            );

            for (const item of itemsRes.rows) {
                const missingCount = Number(item.quantity) - Number(item.existing_count);
                for (let i = 0; i < missingCount; i++) {
                    await this.insertEVoucher(client, item.order_item_id, item.expiry_date);
                }
            }

            await client.query('COMMIT');
            committed = true;
            try {
                await this.sendGiftEVoucherEmail(orderId);
            } catch (emailError) {
                console.error('sendGiftEVoucherEmail error:', emailError);
            }
            return true;
        } catch (err) {
            if (!committed) {
                await client.query('ROLLBACK');
            }
            throw err;
        } finally {
            client.release();
        }
    }

    async insertEVoucher(client, orderItemId, expiryDate) {
        for (let attempts = 0; attempts < 5; attempts++) {
            try {
                await client.query(
                    `
                        INSERT INTO E_Vouchers (order_item_id, unique_code, status, expiry_date)
                        VALUES ($1, $2, 'Unused', $3)
                        RETURNING evoucher_id
                    `,
                    [orderItemId, this.generateUniqueCode(), expiryDate]
                );
                return;
            } catch (error) {
                if (error.code !== '23505') throw error;
            }
        }
        throw new Error('Could not generate a unique e-voucher code.');
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    formatDate(value) {
        if (!value) return 'Không giới hạn';
        return new Date(value).toLocaleDateString('vi-VN');
    }

    async sendGiftEVoucherEmail(orderId) {
        const { rows } = await pool.query(
            `
                SELECT
                    o.order_id, o.shipping_name, o.is_gift, o.gift_recipient_name,
                    o.gift_recipient_email, o.gift_message,
                    ev.unique_code, ev.expiry_date,
                    v.title, p.company_name
                FROM Orders o
                JOIN Order_Items oi ON oi.order_id = o.order_id
                JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
                JOIN Vouchers v ON v.voucher_id = oi.voucher_id
                JOIN Partners p ON p.user_id = v.partner_id
                WHERE o.order_id = $1 AND o.status = $2
                ORDER BY ev.evoucher_id
            `,
            [orderId, ORDER_STATUS.PAID]
        );

        if (rows.length === 0 || !rows[0].is_gift || !rows[0].gift_recipient_email) {
            return;
        }

        const order = rows[0];
        const recipientName = order.gift_recipient_name || 'bạn';
        const buyerName = order.shipping_name || 'một người thân';
        const voucherRows = rows.map((item) => `
            <tr>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
                    <div style="font-weight:700;color:#0f172a;">${this.escapeHtml(item.title)}</div>
                    <div style="font-size:13px;color:#64748b;">${this.escapeHtml(item.company_name)}</div>
                </td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-family:Consolas, monospace;font-weight:800;color:#0f4c81;white-space:nowrap;">${this.escapeHtml(item.unique_code)}</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#475569;white-space:nowrap;">${this.formatDate(item.expiry_date)}</td>
            </tr>
        `).join('');

        const giftMessage = order.gift_message
            ? `<p style="margin:18px 0 0;padding:14px 16px;background:#f8fafc;border-left:4px solid #0f4c81;border-radius:10px;color:#334155;"><strong>Lời nhắn:</strong><br />${this.escapeHtml(order.gift_message)}</p>`
            : '';

        await sendEmail({
            email: order.gift_recipient_email,
            subject: 'Bạn vừa nhận được E-Voucher từ Dealzy',
            template: {
                title: 'Bạn vừa nhận được E-Voucher',
                intro: `Xin chào ${this.escapeHtml(recipientName)}, ${this.escapeHtml(buyerName)} đã gửi tặng bạn E-Voucher trên Dealzy.`,
                body: `
                    <p style="margin:0 0 18px;">Bạn có thể dùng các mã dưới đây tại điểm áp dụng theo điều kiện của từng voucher.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <thead>
                            <tr style="background:#f1f5f9;color:#334155;font-size:13px;text-align:left;">
                                <th style="padding:12px;">Voucher</th>
                                <th style="padding:12px;">Mã sử dụng</th>
                                <th style="padding:12px;">Hạn dùng</th>
                            </tr>
                        </thead>
                        <tbody>${voucherRows}</tbody>
                    </table>
                    ${giftMessage}
                `,
                footer: 'Vui lòng giữ email này để xuất trình mã khi sử dụng E-Voucher.',
            },
        });
    }

    async restoreStockForOrder(client, orderId) {
        await client.query(
            `
                UPDATE Vouchers v
                SET quantity_stock = LEAST(v.total_quantity, v.quantity_stock + reserved.quantity)
                FROM (
                    SELECT voucher_id, SUM(quantity)::int AS quantity
                    FROM Order_Items
                    WHERE order_id = $1
                    GROUP BY voucher_id
                ) reserved
                WHERE reserved.voucher_id = v.voucher_id
            `,
            [orderId]
        );
    }

    async expirePendingOrders(maxAgeMinutes = Number(process.env.PENDING_ORDER_EXPIRY_MINUTES || 30)) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `
                    SELECT order_id
                    FROM Orders
                    WHERE status = $1
                        AND order_date < NOW() - ($2::int * INTERVAL '1 minute')
                    FOR UPDATE SKIP LOCKED
                `,
                [ORDER_STATUS.PENDING, maxAgeMinutes]
            );

            for (const order of rows) {
                await this.restoreStockForOrder(client, order.order_id);
                await client.query(
                    `UPDATE Orders SET status = $1, transaction_reference = COALESCE(transaction_reference, 'SYSTEM_EXPIRED') WHERE order_id = $2`,
                    [ORDER_STATUS.EXPIRED, order.order_id]
                );
            }

            await client.query('COMMIT');
            return rows.length;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async cancelOrder(orderId, customerId, reason = null) {
        return this.closePendingOrder(orderId, customerId, ORDER_STATUS.CANCELLED, reason);
    }

    async markOrderFailed(orderId, customerId, transactionRef = null) {
        return this.closePendingOrder(orderId, customerId, ORDER_STATUS.FAILED, transactionRef);
    }

    async closePendingOrder(orderId, customerId, status, transactionRef = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const orderRes = await client.query(
                'SELECT status FROM Orders WHERE order_id = $1 AND customer_id = $2 FOR UPDATE',
                [orderId, customerId]
            );
            if (orderRes.rows.length === 0) {
                const error = new Error('Order not found.');
                error.statusCode = 404;
                throw error;
            }
            if (orderRes.rows[0].status !== ORDER_STATUS.PENDING) {
                throw new Error('Only pending orders can be changed.');
            }

            await this.restoreStockForOrder(client, orderId);
            await client.query(
                'UPDATE Orders SET status = $1, transaction_reference = COALESCE($2, transaction_reference) WHERE order_id = $3',
                [status, transactionRef, orderId]
            );
            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getOrderEVouchers(orderId, customerId) {
        const order = await this.assertCustomerOwnsOrder(orderId, customerId);
        if (order.status !== ORDER_STATUS.PAID) {
            const error = new Error('E-vouchers are only available after payment.');
            error.statusCode = 403;
            throw error;
        }

        const res = await pool.query(
            `
                SELECT ev.evoucher_id, ev.unique_code, ev.status, ev.expiry_date,
                    ev.used_at_branch_id, ev.used_date,
                    b.branch_name AS used_branch_name,
                    v.voucher_id, v.title, v.image_url, p.company_name
                FROM E_Vouchers ev
                JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
                JOIN Orders o ON oi.order_id = o.order_id
                JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                JOIN Partners p ON v.partner_id = p.user_id
                LEFT JOIN Branches b ON ev.used_at_branch_id = b.branch_id
                WHERE oi.order_id = $1 AND o.customer_id = $2 AND o.status = $3
                ORDER BY ev.evoucher_id
            `,
            [orderId, customerId, ORDER_STATUS.PAID]
        );
        return res.rows;
    }

    generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'DLZ';
        for (let i = 0; i < 9; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async getCustomerEVouchers(customerId) {
        const res = await pool.query(
            `
                SELECT ev.evoucher_id, ev.unique_code, ev.status, ev.expiry_date,
                    ev.used_at_branch_id, ev.used_date,
                    b.branch_name AS used_branch_name,
                    v.voucher_id, v.title, v.image_url, p.company_name,
                    o.order_id, o.order_date AS purchase_date,
                    EXISTS (
                        SELECT 1 FROM Reviews r
                        WHERE r.customer_id = $1 AND r.voucher_id = v.voucher_id
                    ) AS is_reviewed
                FROM E_Vouchers ev
                JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
                JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                JOIN Partners p ON v.partner_id = p.user_id
                JOIN Orders o ON oi.order_id = o.order_id
                LEFT JOIN Branches b ON ev.used_at_branch_id = b.branch_id
                WHERE o.customer_id = $1 AND o.status = $2
                ORDER BY o.order_date DESC, ev.evoucher_id DESC
            `,
            [customerId, ORDER_STATUS.PAID]
        );
        return res.rows;
    }

    async getCustomerOrders(customerId) {
        const res = await pool.query(
            `
                SELECT o.order_id, o.order_date, o.total_amount, o.status, o.payment_method,
                    o.transaction_reference, o.shipping_name, o.shipping_phone, o.shipping_email,
                    o.is_gift, o.gift_recipient_name, o.gift_recipient_phone, o.gift_recipient_email,
                    COALESCE(oi_stats.item_count, 0)::int AS item_count,
                    COALESCE(oi_stats.voucher_quantity, 0)::int AS voucher_quantity,
                    COALESCE(ev_stats.evoucher_count, 0)::int AS evoucher_count
                FROM Orders o
                LEFT JOIN (
                    SELECT
                        order_id,
                        COUNT(*)::int AS item_count,
                        SUM(quantity)::int AS voucher_quantity
                    FROM Order_Items
                    GROUP BY order_id
                ) oi_stats ON oi_stats.order_id = o.order_id
                LEFT JOIN (
                    SELECT
                        oi.order_id,
                        COUNT(ev.evoucher_id)::int AS evoucher_count
                    FROM Order_Items oi
                    JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
                    GROUP BY oi.order_id
                ) ev_stats ON ev_stats.order_id = o.order_id
                WHERE o.customer_id = $1
                ORDER BY o.order_date DESC, o.order_id DESC
            `,
            [customerId]
        );
        return res.rows;
    }

    async getCustomerOrderDetail(orderId, customerId) {
        await this.assertCustomerOwnsOrder(orderId, customerId);

        const orderRes = await pool.query(
            `
                SELECT order_id, customer_id, order_date, total_amount, status, payment_method,
                    transaction_reference, shipping_name, shipping_phone, shipping_email, shipping_address,
                    is_gift, gift_recipient_name, gift_recipient_phone, gift_recipient_email, gift_message
                FROM Orders
                WHERE order_id = $1 AND customer_id = $2
            `,
            [orderId, customerId]
        );

        const itemsRes = await pool.query(
            `
                SELECT oi.order_item_id, oi.voucher_id, oi.quantity, oi.price_at_purchase,
                    v.title, v.image_url, p.company_name
                FROM Order_Items oi
                JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                JOIN Partners p ON v.partner_id = p.user_id
                WHERE oi.order_id = $1
                ORDER BY oi.order_item_id
            `,
            [orderId]
        );

        const evouchers = orderRes.rows[0].status === ORDER_STATUS.PAID
            ? await this.getOrderEVouchers(orderId, customerId)
            : [];

        return { ...orderRes.rows[0], items: itemsRes.rows, evouchers };
    }

    async createReview(customerId, voucherId, rating, comment) {
        const purchaseCheck = await pool.query(
            `
                SELECT 1 FROM Orders o
                JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.customer_id = $1 AND oi.voucher_id = $2 AND o.status = $3
                LIMIT 1
            `,
            [customerId, voucherId, ORDER_STATUS.PAID]
        );
        if (purchaseCheck.rows.length === 0) {
            throw new Error('You can only review vouchers from paid orders.');
        }

        const reviewCheck = await pool.query(
            'SELECT 1 FROM Reviews WHERE customer_id = $1 AND voucher_id = $2 LIMIT 1',
            [customerId, voucherId]
        );
        if (reviewCheck.rows.length > 0) {
            throw new Error('You have already reviewed this voucher.');
        }

        const res = await pool.query(
            `
                INSERT INTO Reviews (customer_id, voucher_id, rating, comment)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `,
            [customerId, voucherId, rating, comment]
        );
        return res.rows[0];
    }
}

module.exports = new OrderService();
