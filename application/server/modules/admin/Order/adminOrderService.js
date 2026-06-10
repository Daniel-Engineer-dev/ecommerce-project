const pool = require('../../../config/db');
const orderService = require('../../customer/orderService');

class AdminOrderService {
    async getAllOrders({ status, search, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const values = [];
        let idx = 1;

        let countQuery = `SELECT COUNT(*) as total FROM Orders o JOIN Users u ON o.customer_id = u.user_id LEFT JOIN Customers c ON u.user_id = c.user_id WHERE 1=1`;
        let dataQuery = `SELECT o.*, u.username, u.email, c.full_name FROM Orders o JOIN Users u ON o.customer_id = u.user_id LEFT JOIN Customers c ON u.user_id = c.user_id WHERE 1=1`;
        let filterQuery = '';

        if (status) {
            filterQuery += ` AND o.status = $${idx++}`;
            values.push(status);
        }

        if (search && search.trim() !== '') {
            filterQuery += ` AND (o.order_id::TEXT ILIKE $${idx} OR u.username ILIKE $${idx} OR c.full_name ILIKE $${idx})`;
            values.push(`%${search.trim()}%`);
            idx++;
        }

        countQuery += filterQuery;
        dataQuery += filterQuery + ` ORDER BY o.order_date DESC LIMIT $${idx++} OFFSET $${idx++}`;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, [...values]),
            pool.query(dataQuery, [...values, limit, offset])
        ]);

        const totalItems = parseInt(countResult.rows[0].total, 10);
        return {
            orders: dataResult.rows,
            pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: parseInt(page, 10), limit: parseInt(limit, 10) }
        };
    }

    async getOrderById(orderId) {
        const orderQuery = `
            SELECT o.*, u.username, u.email, c.full_name, u.phone, c.address
            FROM Orders o
            JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON u.user_id = c.user_id
            WHERE o.order_id = $1
        `;
        const orderRes = await pool.query(orderQuery, [orderId]);
        if (orderRes.rowCount === 0) throw new Error("Không tìm thấy đơn hàng");

        const itemsQuery = `
            SELECT oi.*, v.title, v.image_url, v.sale_price, p.company_name
            FROM Order_Items oi
            JOIN Vouchers v ON oi.voucher_id = v.voucher_id
            JOIN Partners p ON v.partner_id = p.user_id
            WHERE oi.order_id = $1
        `;
        const itemsRes = await pool.query(itemsQuery, [orderId]);

        const evouchersQuery = `
            SELECT ev.* 
            FROM E_Vouchers ev
            JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
            WHERE oi.order_id = $1
        `;
        const evouchersRes = await pool.query(evouchersQuery, [orderId]);

        const items = itemsRes.rows.map(item => ({
            ...item,
            evouchers: evouchersRes.rows.filter(ev => ev.order_item_id === item.order_item_id)
        }));

        return { order: orderRes.rows[0], items };
    }

    async confirmPayment(orderId, adminId) {
        const order = await pool.query('SELECT payment_method FROM Orders WHERE order_id = $1', [orderId]);
        if (order.rowCount === 0) throw new Error('Order not found');
        if (order.rows[0].payment_method !== 'VietQR') {
            throw new Error('Manual payment confirmation is only allowed for VietQR orders');
        }
        await orderService.completeOrder(orderId, `ADMIN_CONFIRM_${Date.now()}`);
        await pool.query(
            `INSERT INTO System_Logs (user_id, action, table_name, record_id) VALUES ($1, $2, $3, $4)`,
            [adminId, 'CONFIRM ORDER PAYMENT', 'Orders', orderId]
        );

        const result = await pool.query('SELECT * FROM Orders WHERE order_id = $1', [orderId]);
        return result.rows[0];
    }

    async refundAndCancelOrder(orderId, adminId, reason) {
        if (!reason || reason.trim() === '') throw new Error("Thiếu lý do");
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const orderRes = await client.query("SELECT * FROM Orders WHERE order_id = $1 FOR UPDATE", [orderId]);
            if (orderRes.rowCount === 0) throw new Error("Không tìm thấy đơn hàng");
            
            const order = orderRes.rows[0];
            if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Failed' || order.status === 'Expired') {
                throw new Error("Đơn hàng này đã bị đóng từ trước");
            }
            if (order.status !== 'Paid') {
                throw new Error("Chỉ đơn hàng đã thanh toán mới có thể hoàn tiền");
            }

            // 1. Cập nhật trạng thái cột status thành 'Refunded'
            const usedVoucher = await client.query(
                `SELECT 1
                 FROM E_Vouchers ev
                 JOIN Order_Items oi ON oi.order_item_id = ev.order_item_id
                 WHERE oi.order_id = $1 AND ev.status = 'Used'
                 LIMIT 1`,
                [orderId]
            );
            if (usedVoucher.rows.length > 0) {
                throw new Error('Khong the hoan tien don hang da su dung voucher');
            }

            await orderService.restoreStockForOrder(client, orderId);

            await client.query(
                `UPDATE Orders SET status = 'Refunded' WHERE order_id = $1`, 
                [orderId]
            );

            // 2. Khóa các mã E-Voucher lại.
            await client.query(
                `UPDATE E_Vouchers
                 SET status = 'Locked'
                 WHERE order_item_id IN (SELECT order_item_id FROM Order_Items WHERE order_id = $1)
                    AND status <> 'Locked'`, 
                [orderId]
            );

            // 3. Ghi log hệ thống
            await client.query(
                `INSERT INTO System_Logs (user_id, action, table_name, record_id) VALUES ($1, $2, $3, $4)`, 
                [adminId, `REFUND ORDER: ${reason}`, 'Orders', orderId]
            );
            
            await client.query('COMMIT');
            return { orderId, status: 'Refunded' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new AdminOrderService();
