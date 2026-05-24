const pool = require('../../config/db');

class OrderService {
    /**
     * Tạo đơn hàng mới ở trạng thái Pending
     */
    async createOrder(customerId, shippingInfo, items, paymentMethod) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Lấy địa chỉ động do khách hàng nhập từ shippingInfo
            const { name, phone, email, address } = shippingInfo;
            
            // 1. Tính tổng số tiền dựa trên giá trị sale_price thực tế của vouchers trong DB (Chống hack giá client)
            let totalAmount = 0;
            for (const item of items) {
                const voucherRes = await client.query('SELECT sale_price FROM Vouchers WHERE voucher_id = $1', [item.voucher_id]);
                if (voucherRes.rows.length === 0) {
                    throw new Error(`Voucher ID ${item.voucher_id} không tồn tại.`);
                }
                totalAmount += parseFloat(voucherRes.rows[0].sale_price) * item.quantity;
            }
            
            // 2. Chèn đơn hàng mới ở trạng thái Pending (Đồng thời lưu shipping_address)
            const orderQuery = `
                INSERT INTO Orders (customer_id, total_amount, status, payment_method, shipping_name, shipping_phone, shipping_email, shipping_address)
                VALUES ($1, $2, 'Pending', $3, $4, $5, $6, $7)
                RETURNING order_id
            `;
            const orderRes = await client.query(orderQuery, [
                customerId, 
                totalAmount, 
                paymentMethod, 
                name, 
                phone, 
                email,
                address || null
            ]);
            const orderId = orderRes.rows[0].order_id;
            
            // 3. Chèn các mặt hàng chi tiết (Ràng buộc nghiệp vụ tồn kho sẽ tự động chạy qua DB Trigger trg_validate_order_item)
            const itemQuery = `
                INSERT INTO Order_Items (order_id, voucher_id, quantity, price_at_purchase)
                VALUES ($1, $2, $3, $4)
                RETURNING order_item_id
            `;
            for (const item of items) {
                const voucherRes = await client.query('SELECT sale_price FROM Vouchers WHERE voucher_id = $1', [item.voucher_id]);
                const price = voucherRes.rows[0].sale_price;
                await client.query(itemQuery, [orderId, item.voucher_id, item.quantity, price]);
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
    
    /**
     * Cập nhật đơn hàng thành công (Paid) và tự động sinh mã E-Vouchers để khách hàng sử dụng
     */
    async completeOrder(orderId, transactionRef) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Kiểm tra đơn hàng hiện tại
            const orderRes = await client.query('SELECT status, total_amount FROM Orders WHERE order_id = $1', [orderId]);
            if (orderRes.rows.length === 0) {
                throw new Error('Đơn hàng không tồn tại.');
            }
            
            const order = orderRes.rows[0];
            if (order.status === 'Paid') {
                // Đã xử lý thanh toán trước đó (Chống lặp lệnh thanh toán kép từ IPN)
                await client.query('COMMIT');
                return true;
            }
            
            // 2. Cập nhật trạng thái đơn hàng thành Paid
            await client.query(
                `UPDATE Orders SET status = 'Paid', transaction_reference = $1 WHERE order_id = $2`,
                [transactionRef || 'SYSTEM_AUTO', orderId]
            );
            
            // 3. Lấy chi tiết các voucher đã mua và thời hạn hết hạn gốc của voucher
            const itemsQuery = `
                SELECT oi.order_item_id, oi.voucher_id, oi.quantity, v.expiry_date 
                FROM Order_Items oi
                JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                WHERE oi.order_id = $1
            `;
            const itemsRes = await client.query(itemsQuery, [orderId]);
            
            // 4. Phát hành mã E-Vouchers tương ứng với từng số lượng (quantity)
            const evoucherQuery = `
                INSERT INTO E_Vouchers (order_item_id, unique_code, status, expiry_date)
                VALUES ($1, $2, 'Unused', $3)
            `;
            
            for (const item of itemsRes.rows) {
                for (let i = 0; i < item.quantity; i++) {
                    const uniqueCode = this.generateUniqueCode();
                    await client.query(evoucherQuery, [
                        item.order_item_id, 
                        uniqueCode, 
                        item.expiry_date
                    ]);
                }
            }
            
            await client.query('COMMIT');
            console.log(`Đơn hàng #${orderId} hoàn tất! Đã phát hành mã E-Voucher.`);
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
    
    /**
     * Lấy danh sách E-Vouchers đã mua của một đơn hàng để hiển thị trực quan ở Frontend
     */
    async getOrderEVouchers(orderId) {
        const query = `
            SELECT ev.unique_code, ev.status, ev.expiry_date, v.title, v.image_url, p.company_name
            FROM E_Vouchers ev
            JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
            JOIN Vouchers v ON oi.voucher_id = v.voucher_id
            JOIN Partners p ON v.partner_id = p.user_id
            WHERE oi.order_id = $1
        `;
        const res = await pool.query(query, [orderId]);
        return res.rows;
    }
    
    /**
     * Sinh mã E-Voucher ngẫu nhiên 12 ký tự duy nhất
     */
    generateUniqueCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'DLZ';
        for (let i = 0; i < 9; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Lấy toàn bộ danh sách E-Vouchers đã mua của khách hàng đăng nhập
     */
    async getCustomerEVouchers(customerId) {
        const query = `
            SELECT 
                ev.unique_code, 
                ev.status, 
                ev.expiry_date, 
                v.voucher_id,
                v.title, 
                v.image_url, 
                p.company_name,
                o.order_id,
                o.order_date as purchase_date,
                EXISTS (
                    SELECT 1 FROM Reviews r 
                    WHERE r.customer_id = $1 AND r.voucher_id = v.voucher_id
                ) as is_reviewed
            FROM E_Vouchers ev
            JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
            JOIN Vouchers v ON oi.voucher_id = v.voucher_id
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Orders o ON oi.order_id = o.order_id
            WHERE o.customer_id = $1 AND o.status = 'Paid'
            ORDER BY o.order_date DESC
        `;
        const res = await pool.query(query, [customerId]);
        return res.rows;
    }

    /**
     * Tạo đánh giá mới cho Voucher
     */
    async createReview(customerId, voucherId, rating, comment) {
        // 1. Kiểm tra khách hàng đã mua voucher này chưa
        const purchaseCheckQuery = `
            SELECT 1 FROM Orders o
            JOIN Order_Items oi ON o.order_id = oi.order_id
            WHERE o.customer_id = $1 AND oi.voucher_id = $2 AND o.status = 'Paid'
            LIMIT 1
        `;
        const purchaseCheck = await pool.query(purchaseCheckQuery, [customerId, voucherId]);
        if (purchaseCheck.rows.length === 0) {
            throw new Error('Bạn chỉ có thể đánh giá các voucher mà bạn đã mua thành công.');
        }

        // 2. Kiểm tra xem khách hàng đã đánh giá voucher này chưa
        const reviewCheckQuery = `
            SELECT 1 FROM Reviews 
            WHERE customer_id = $1 AND voucher_id = $2
            LIMIT 1
        `;
        const reviewCheck = await pool.query(reviewCheckQuery, [customerId, voucherId]);
        if (reviewCheck.rows.length > 0) {
            throw new Error('Bạn đã đánh giá voucher này rồi.');
        }

        // 3. Thêm đánh giá mới vào cơ sở dữ liệu
        const insertQuery = `
            INSERT INTO Reviews (customer_id, voucher_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const res = await pool.query(insertQuery, [customerId, voucherId, rating, comment]);
        return res.rows[0];
    }
}

module.exports = new OrderService();
