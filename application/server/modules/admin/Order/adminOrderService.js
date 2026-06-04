// modules/admin/adminOrder/adminOrderService.js
const pool = require('../../../config/db');

class AdminOrderService {
    /**
     * 1. Tra cứu danh sách đơn hàng (Hỗ trợ phân trang, lọc theo trạng thái và tìm kiếm)
     */
    async getAllOrders({ status, search, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const values = [];
        let idx = 1;

        let countQuery = `
            SELECT COUNT(*) as total 
            FROM Orders o
            JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON u.user_id = c.user_id
            WHERE 1=1
        `;

        let dataQuery = `
            SELECT o.*, u.username, u.email, c.full_name
            FROM Orders o
            JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON u.user_id = c.user_id
            WHERE 1=1
        `;

        let filterQuery = '';

        if (status) {
            filterQuery += ` AND o.status = $${idx++}`;
            values.push(status);
        }

        if (search && search.trim() !== '') {
            filterQuery += ` AND (
                o.order_id::TEXT     ILIKE $${idx} OR 
                u.username           ILIKE $${idx} OR 
                c.full_name          ILIKE $${idx}
            )`;
            values.push(`%${search.trim()}%`);
            idx++;
        }

        countQuery += filterQuery;
        dataQuery += filterQuery;
        dataQuery += ` ORDER BY o.order_date DESC LIMIT $${idx++} OFFSET $${idx++}`;

        const countValues = [...values];
        const dataValues = [...values, limit, offset];

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, countValues),
            pool.query(dataQuery, dataValues)
        ]);

        const totalItems = parseInt(countResult.rows[0].total, 10);
        return {
            orders: dataResult.rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
                limit: parseInt(limit, 10)
            }
        };
    }

    /**
     * 2. Xem chi tiết đơn hàng (Kèm các voucher items nằm bên trong đơn)
     */
    async getOrderById(orderId) {
        const orderQuery = `
            SELECT o.*, u.username, u.email, c.full_name, u.phone, c.address
            FROM Orders o
            JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON u.user_id = c.user_id
            WHERE o.order_id = $1
        `;
        const orderRes = await pool.query(orderQuery, [orderId]);
        if (orderRes.rowCount === 0) throw new Error("Không tìm thấy đơn hàng yêu cầu");

        const itemsQuery = `
            SELECT oi.*, v.title, v.image_url, v.sale_price
            FROM Order_Items oi
            JOIN Vouchers v ON oi.voucher_id = v.voucher_id
            WHERE oi.order_id = $1
        `;
        const itemsRes = await pool.query(itemsQuery, [orderId]);

        return {
            order: orderRes.rows[0],
            items: itemsRes.rows
        };
    }

    /**
     * 3. Xử lý trạng thái thanh toán khẩn cấp (Phê duyệt đơn bị treo cổng thanh toán)
     */
    async confirmPayment(orderId, adminId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Cập nhật trạng thái đơn hàng thành 'Paid'
            const updateOrder = `
                UPDATE Orders 
                SET status = 'Paid', payment_status = 'Paid' 
                WHERE order_id = $1 AND status = 'Pending Payment'
                RETURNING *
            `;
            const result = await client.query(updateOrder, [orderId]);
            if (result.rowCount === 0) {
                throw new Error("Đơn hàng không tồn tại hoặc đã được xử lý thanh toán từ trước");
            }

            // Ghi nhận log bảo mật hệ thống (Thực hiện nghiêm ngặt quy tắc RB-12)
            const logQuery = `
                INSERT INTO System_Logs (user_id, action, table_name, record_id)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(logQuery, [adminId, 'CONFIRM ORDER PAYMENT MANUALLY', 'Orders', orderId]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * 4. Hủy đơn hàng và thực hiện Hoàn tiền mô phỏng về Ví Khách hàng
     */
    async refundAndCancelOrder(orderId, adminId, reason) {
        if (!reason || reason.trim() === '') throw new Error("Lý do hoàn hủy bắt buộc phải cung cấp");

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 4.1. Lấy thông tin đơn hàng hiện tại để kiểm tra điều kiện hoàn tiền
            const orderRes = await client.query("SELECT * FROM Orders WHERE order_id = $1", [orderId]);
            if (orderRes.rowCount === 0) throw new Error("Không tìm thấy đơn hàng");
            
            const order = orderRes.rows[0];
            if (order.status === 'Cancelled') throw new Error("Đơn hàng này đã bị hủy từ trước");

            // 4.2. Cập nhật trạng thái đơn hàng thành 'Cancelled' và bổ sung thông tin lưu vết
            const cancelQuery = `
                UPDATE Orders 
                SET status = 'Cancelled', payment_status = 'Refunded', refund_reason = $1, 
                    processed_by = $2, processed_at = NOW()
                WHERE order_id = $3
            `;
            await client.query(cancelQuery, [reason, adminId, orderId]);

            // 4.3. Thu hồi mã e-voucher phát hành nếu đơn hàng đã thanh toán thành công trước đó (Đổi trạng thái sang Locked)
            if (order.status === 'Paid') {
                await client.query(`
                    UPDATE E_Vouchers 
                    SET status = 'Locked' 
                    WHERE order_item_id IN (SELECT order_item_id FROM Order_Items WHERE order_id = $1)
                `, [orderId]);

                // 4.4. Hoàn tiền mô phỏng (Cộng tiền lại vào bảng Wallets của khách hàng)
                const updateWallet = `
                    UPDATE Wallets 
                    SET balance = balance + $1, updated_at = NOW() 
                    WHERE customer_id = $2
                `;
                await client.query(updateWallet, [order.total_amount, order.user_id]);

                // 4.5. Ghi nhận 1 dòng biến động số dư vào nhật ký giao dịch ví
                const walletTxQuery = `
                    INSERT INTO Wallet_Transactions (wallet_id, order_id, amount, transaction_type, description)
                    VALUES ((SELECT wallet_id FROM Wallets WHERE customer_id = $1), $2, $3, 'Refund', $4)
                `;
                await client.query(walletTxQuery, [order.user_id, orderId, order.total_amount, `Hoàn trả đơn hàng #${orderId}. Lý do: ${reason}`]);
            }

            // 4.6. Ghi log kiểm toán thao tác trực tiếp của Admin vào System_Logs
            const logQuery = `
                INSERT INTO System_Logs (user_id, action, table_name, record_id)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(logQuery, [adminId, `CANCEL & REFUND ORDER - REASON: ${reason}`, 'Orders', orderId]);

            await client.query('COMMIT');
            return { orderId, status: 'Cancelled', payment_status: 'Refunded' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new AdminOrderService();