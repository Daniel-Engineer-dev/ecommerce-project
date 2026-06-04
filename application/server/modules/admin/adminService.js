const pool = require('../../config/db');
const { sendEmail } = require('../../utils/sendEmail');
const { logAction } = require('../../utils/systemLog');
const orderService = require('../customer/orderService');

const sendNotificationEmail = async (mailOptions) => {
    try {
        await sendEmail(mailOptions);
        return { sent: true, error: null };
    } catch (error) {
        console.error('Partner notification email failed:', error.message);
        return { sent: false, error: error.message };
    }
};

class AdminService {
    /**
     * Lấy danh sách hồ sơ đối tác đang chờ duyệt (Pending)
     */
    async getPendingPartners() {
        const query = `
            SELECT u.user_id, u.username, u.email, u.phone,
                   p.company_name, p.representative_name, p.tax_id, p.headquarters, p.status
            FROM Users u
            JOIN Partners p ON u.user_id = p.user_id
            WHERE p.status = 'Pending'
            ORDER BY p.user_id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async approvePartner(id, adminId = null) {
        await pool.query("UPDATE Partners SET status = 'Approved' WHERE user_id = $1", [id]);
        const userRes = await pool.query(
            `SELECT u.email, u.username, p.company_name
             FROM Users u
             LEFT JOIN Partners p ON p.user_id = u.user_id
             WHERE u.user_id = $1`,
            [id]
        );
        const user = userRes.rows[0];
        let emailResult = { sent: false, error: null };

        if (user && user.email) {
            const partnerUrl = process.env.PARTNER_URL || 'http://localhost:5174';
            const displayName = user.company_name || user.username;
            emailResult = await sendNotificationEmail({
                email: user.email,
                subject: 'Dealzy - Hồ sơ đối tác đã được phê duyệt',
                template: {
                    title: 'Hồ sơ đối tác đã được phê duyệt',
                    intro: `Xin chào ${displayName},`,
                    body: `
                        <p style="margin:0 0 16px;">Chúc mừng bạn! Hồ sơ đối tác của bạn đã được Dealzy phê duyệt và tài khoản hiện đã sẵn sàng để sử dụng.</p>
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:22px 0;border:1px solid #dbeafe;border-radius:14px;background:#f8fbff;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <div style="font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Trạng thái tài khoản</div>
                                    <div style="margin-top:6px;color:#0f4c81;font-size:18px;font-weight:800;">Đã phê duyệt</div>
                                </td>
                            </tr>
                        </table>
                        <p style="margin:0 0 10px;">Bạn có thể đăng nhập vào trang đối tác để quản lý thông tin doanh nghiệp, tạo chương trình ưu đãi và theo dõi hiệu quả kinh doanh.</p>
                        <p style="margin:0;">Nếu cần hỗ trợ trong quá trình thiết lập gian hàng, đội ngũ Dealzy luôn sẵn sàng đồng hành cùng bạn.</p>
                    `,
                    buttonText: 'Truy cập trang đối tác',
                    buttonUrl: partnerUrl,
                    footer: 'Cảm ơn bạn đã lựa chọn Dealzy làm kênh kết nối khách hàng. Chúc bạn vận hành hiệu quả và đạt được nhiều kết quả tích cực.',
                },
            });
        }

        await logAction(adminId, 'APPROVE_PARTNER', 'Partners', id);
        return { success: true, emailSent: emailResult.sent, emailError: emailResult.error };
    }

    async rejectPartner(id, adminId = null) {
        await pool.query("UPDATE Partners SET status = 'Rejected' WHERE user_id = $1", [id]);
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];
        let emailResult = { sent: false, error: null };

        if (user && user.email) {
            emailResult = await sendNotificationEmail({
                email: user.email,
                subject: 'Ho so doi tac bi tu choi',
                template: {
                    title: 'Ho so doi tac bi tu choi',
                    intro: `Xin chao ${user.username},`,
                    body: 'Ho so doi tac cua ban da bi tu choi. Vui long lien he bo phan ho tro de biet them chi tiet.',
                    footer: 'Dealzy se luon san sang ho tro ban hoan thien ho so.',
                },
            });
        }

        await logAction(adminId, 'REJECT_PARTNER', 'Partners', id);
        return { success: true, emailSent: emailResult.sent, emailError: emailResult.error };
    }

    async getAllUsers({ role, search, status, page = 1, limit = 10 }) {
        const offset = (Number(page) - 1) * Number(limit);
        const values = [];
        let idx = 1;

        let baseQuery = `
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.phone,
                u.role,
                CASE
                    WHEN u.role = 'Customer' THEN c.full_name
                    WHEN u.role = 'Partner'  THEN p.company_name
                    ELSE 'Admin'
                END AS display_name,
                CASE
                    WHEN u.role = 'Partner' THEN p.status
                    ELSE NULL
                END AS partner_status,
                CASE
                    WHEN u.role = 'Partner' THEN p.is_active
                    WHEN u.role = 'Customer' THEN c.is_active
                    ELSE TRUE
                END AS is_active
            FROM Users u
            LEFT JOIN Customers c ON u.user_id = c.user_id
            LEFT JOIN Partners p ON u.user_id = p.user_id
            WHERE u.role <> 'Admin'
        `;

        if (role) {
            baseQuery += ` AND u.role = $${idx++}`;
            values.push(role);
        }

        if (status === 'locked') {
            baseQuery += ` AND (
                (u.role = 'Partner' AND p.is_active = FALSE) OR
                (u.role = 'Customer' AND c.is_active = FALSE)
            )`;
        }

        if (search) {
            baseQuery += ` AND (
                u.username ILIKE $${idx} OR
                u.email ILIKE $${idx} OR
                u.phone ILIKE $${idx} OR
                c.full_name ILIKE $${idx} OR
                p.company_name ILIKE $${idx}
            )`;
            values.push(`%${search}%`);
            idx++;
        }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${baseQuery}) AS sub`, values);
        const total = parseInt(countResult.rows[0].count, 10);

        baseQuery += ` ORDER BY u.user_id DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(Number(limit), offset);

        const result = await pool.query(baseQuery, values);
        return {
            users: result.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }

    async getUserById(id) {
        const userRes = await pool.query(
            'SELECT user_id, username, email, phone, role FROM Users WHERE user_id = $1',
            [id]
        );
        if (userRes.rows.length === 0) throw new Error('Nguoi dung khong ton tai');
        const user = userRes.rows[0];

        if (user.role === 'Partner') {
            const partnerRes = await pool.query(
                `SELECT company_name, representative_name, tax_id, headquarters, status, is_active
                 FROM Partners WHERE user_id = $1`,
                [id]
            );
            return { ...user, ...(partnerRes.rows[0] || {}) };

        }

        if (user.role === 'Customer') {
            const customerRes = await pool.query(
                `SELECT full_name, dob, address, is_active
                 FROM Customers WHERE user_id = $1`,
                [id]
            );
            return { ...user, ...customerRes.rows[0] };
        }

        return user;
    }

    async changeUserRole(id, newRole, adminId = null) {
        if (!['Customer', 'Partner', 'Admin'].includes(newRole)) {
            throw new Error('Role khong hop le');
        }
        await pool.query('UPDATE Users SET role = $1 WHERE user_id = $2', [newRole, id]);
        await logAction(adminId, `CHANGE_USER_ROLE:${newRole}`, 'Users', id);
        return { success: true };
    }

    async getUserStats() {
        const result = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE role = 'Customer') AS total_customers,
                COUNT(*) FILTER (WHERE role = 'Partner') AS total_partners,
                COUNT(*) AS total_users
            FROM Users
            WHERE role <> 'Admin'
        `);
        const partnerStats = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                COUNT(*) FILTER (WHERE is_active = false) AS locked
            FROM Partners
        `);
        return { ...result.rows[0], ...partnerStats.rows[0] };
    }

    async toggleUserLock(id, currentLockState, adminId = null) {
        const userRes = await pool.query('SELECT role FROM Users WHERE user_id = $1', [id]);
        if (userRes.rowCount === 0) throw new Error('Nguoi dung khong ton tai');
        const { role } = userRes.rows[0];

        const targetTable = role === 'Partner' ? 'Partners' : 'Customers';
        const newActiveState = !currentLockState;

        const res = await pool.query(
            `UPDATE ${targetTable} SET is_active = $1 WHERE user_id = $2 RETURNING user_id`,
            [newActiveState, id]
        );

        if (res.rowCount === 0) throw new Error(`Khong the cap nhat trang thai cho ${role}`);
        await logAction(adminId, newActiveState ? 'UNLOCK_USER' : 'LOCK_USER', targetTable, id);
        return { success: true, is_active: newActiveState, role };
    }

    async getOrders({ status, search, page = 1, limit = 10 }) {
        const offset = (Number(page) - 1) * Number(limit);
        const values = [];
        let idx = 1;

        let baseQuery = `
            SELECT
                o.order_id,
                o.customer_id,
                o.order_date,
                o.total_amount,
                o.status,
                o.payment_method,
                o.transaction_reference,
                o.shipping_name,
                o.shipping_phone,
                o.shipping_email,
                u.username AS customer_username,
                u.email AS customer_email,
                c.full_name AS customer_name,
                COUNT(DISTINCT oi.order_item_id)::int AS item_count,
                COALESCE(SUM(oi.quantity), 0)::int AS voucher_quantity,
                COUNT(ev.evoucher_id)::int AS evoucher_count
            FROM Orders o
            LEFT JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON o.customer_id = c.user_id
            LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
            LEFT JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
            WHERE 1=1
        `;

        if (status) {
            baseQuery += ` AND o.status = $${idx++}`;
            values.push(status);
        }

        if (search) {
            baseQuery += ` AND (
                o.order_id::TEXT ILIKE $${idx} OR
                u.username ILIKE $${idx} OR
                u.email ILIKE $${idx} OR
                c.full_name ILIKE $${idx} OR
                o.shipping_name ILIKE $${idx} OR
                o.shipping_phone ILIKE $${idx}
            )`;
            values.push(`%${search}%`);
            idx++;
        }

        const groupBy = `
            GROUP BY o.order_id, u.username, u.email, c.full_name
        `;

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM (${baseQuery} ${groupBy}) AS order_rows`,
            values
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const dataResult = await pool.query(
            `${baseQuery} ${groupBy} ORDER BY o.order_date DESC, o.order_id DESC LIMIT $${idx++} OFFSET $${idx++}`,
            [...values, Number(limit), offset]
        );

        return {
            orders: dataResult.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)) || 1,
        };
    }

    async getOrderDetail(orderId) {
        const orderRes = await pool.query(
            `
                SELECT o.*, u.username AS customer_username, u.email AS customer_email,
                    c.full_name AS customer_name, c.address AS customer_address
                FROM Orders o
                LEFT JOIN Users u ON o.customer_id = u.user_id
                LEFT JOIN Customers c ON o.customer_id = c.user_id
                WHERE o.order_id = $1
            `,
            [orderId]
        );
        if (orderRes.rows.length === 0) throw new Error('Don hang khong ton tai');

        const itemsRes = await pool.query(
            `
                SELECT oi.order_item_id, oi.voucher_id, oi.quantity, oi.price_at_purchase,
                    v.title, v.image_url, p.company_name
                FROM Order_Items oi
                JOIN Vouchers v ON oi.voucher_id = v.voucher_id
                LEFT JOIN Partners p ON v.partner_id = p.user_id
                WHERE oi.order_id = $1
                ORDER BY oi.order_item_id
            `,
            [orderId]
        );

        const evoucherRes = await pool.query(
            `
                SELECT ev.evoucher_id, ev.order_item_id, ev.unique_code, ev.status,
                    ev.issued_at, ev.expiry_date, ev.used_date,
                    b.branch_name AS used_branch_name
                FROM E_Vouchers ev
                JOIN Order_Items oi ON ev.order_item_id = oi.order_item_id
                LEFT JOIN Branches b ON ev.used_at_branch_id = b.branch_id
                WHERE oi.order_id = $1
                ORDER BY ev.evoucher_id
            `,
            [orderId]
        );

        return { ...orderRes.rows[0], items: itemsRes.rows, evouchers: evoucherRes.rows };
    }

    async updateOrderStatus(orderId, status, adminId = null, note = null) {
        const allowed = ['Pending', 'Paid', 'Cancelled', 'Failed', 'Expired', 'Refunded'];
        if (!allowed.includes(status)) throw new Error('Trang thai don hang khong hop le');

        if (status === 'Paid') {
            await orderService.completeOrder(orderId, note || `ADMIN_PAID_${Date.now()}`);
            await logAction(adminId, 'MARK_ORDER_PAID', 'Orders', orderId);
            return this.getOrderDetail(orderId);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const orderRes = await client.query('SELECT status FROM Orders WHERE order_id = $1 FOR UPDATE', [orderId]);
            if (orderRes.rows.length === 0) throw new Error('Don hang khong ton tai');

            const currentStatus = orderRes.rows[0].status;
            if (currentStatus === 'Pending' && ['Cancelled', 'Failed', 'Expired'].includes(status)) {
                await orderService.restoreStockForOrder(client, orderId);
            }

            if (status === 'Refunded') {
                await client.query(
                    `
                        UPDATE E_Vouchers ev
                        SET status = 'Locked'
                        FROM Order_Items oi
                        WHERE ev.order_item_id = oi.order_item_id
                            AND oi.order_id = $1
                            AND ev.status = 'Unused'
                    `,
                    [orderId]
                );
            }

            await client.query(
                `
                    UPDATE Orders
                    SET status = $1, transaction_reference = COALESCE($2, transaction_reference)
                    WHERE order_id = $3
                `,
                [status, note, orderId]
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        await logAction(adminId, `UPDATE_ORDER_STATUS:${status}`, 'Orders', orderId);
        return this.getOrderDetail(orderId);
    }

    async getComplaints({ status, search, page = 1, limit = 10 }) {
        const offset = (Number(page) - 1) * Number(limit);
        const values = [];
        let idx = 1;

        let baseQuery = `
            SELECT c.*, u.username, u.email, cu.full_name,
                COUNT(cr.response_id)::int AS response_count
            FROM Complaints c
            LEFT JOIN Users u ON c.customer_id = u.user_id
            LEFT JOIN Customers cu ON c.customer_id = cu.user_id
            LEFT JOIN Complaint_Responses cr ON c.complaint_id = cr.complaint_id
            WHERE 1=1
        `;

        if (status) {
            baseQuery += ` AND c.status = $${idx++}`;
            values.push(status);
        }
        if (search) {
            baseQuery += ` AND (
                c.complaint_id::TEXT ILIKE $${idx} OR
                c.title ILIKE $${idx} OR
                c.content ILIKE $${idx} OR
                u.username ILIKE $${idx} OR
                u.email ILIKE $${idx}
            )`;
            values.push(`%${search}%`);
            idx++;
        }

        const groupBy = 'GROUP BY c.complaint_id, u.username, u.email, cu.full_name';
        const countResult = await pool.query(`SELECT COUNT(*) FROM (${baseQuery} ${groupBy}) AS complaint_rows`, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataResult = await pool.query(
            `${baseQuery} ${groupBy} ORDER BY c.created_at DESC, c.complaint_id DESC LIMIT $${idx++} OFFSET $${idx++}`,
            [...values, Number(limit), offset]
        );

        return {
            complaints: dataResult.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)) || 1,
        };
    }

    async updateComplaintStatus(complaintId, status, adminId = null) {
        const allowed = ['Pending', 'Processing', 'Resolved', 'Rejected'];
        if (!allowed.includes(status)) throw new Error('Trang thai khieu nai khong hop le');

        const result = await pool.query(
            'UPDATE Complaints SET status = $1 WHERE complaint_id = $2 RETURNING *',
            [status, complaintId]
        );
        if (result.rowCount === 0) throw new Error('Khieu nai khong ton tai');
        await logAction(adminId, `UPDATE_COMPLAINT_STATUS:${status}`, 'Complaints', complaintId);
        return result.rows[0];
    }

    async respondComplaint(complaintId, responderId, content) {
        if (!content || !content.trim()) throw new Error('Noi dung phan hoi khong duoc trong');

        const result = await pool.query(
            `
                INSERT INTO Complaint_Responses (complaint_id, responder_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [complaintId, responderId, content.trim()]
        );
        await pool.query(
            "UPDATE Complaints SET status = 'Processing' WHERE complaint_id = $1 AND status = 'Pending'",
            [complaintId]
        );
        await logAction(responderId, 'RESPOND_COMPLAINT', 'Complaints', complaintId);
        return result.rows[0];
    }

    async getSystemLogs({ search, page = 1, limit = 20 }) {
        const offset = (Number(page) - 1) * Number(limit);
        const values = [];
        let idx = 1;

        let baseQuery = `
            SELECT l.*, u.username, u.email, u.role
            FROM System_Logs l
            LEFT JOIN Users u ON l.user_id = u.user_id
            WHERE 1=1
        `;

        if (search) {
            baseQuery += ` AND (
                l.action ILIKE $${idx} OR
                l.table_name ILIKE $${idx} OR
                l.record_id::TEXT ILIKE $${idx} OR
                u.username ILIKE $${idx} OR
                u.email ILIKE $${idx}
            )`;
            values.push(`%${search}%`);
            idx++;
        }

        const countResult = await pool.query(`SELECT COUNT(*) FROM (${baseQuery}) AS logs`, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataResult = await pool.query(
            `${baseQuery} ORDER BY l.created_at DESC, l.log_id DESC LIMIT $${idx++} OFFSET $${idx++}`,
            [...values, Number(limit), offset]
        );

        return {
            logs: dataResult.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)) || 1,
        };
    }

    async ensureContentTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Content_Items (
                content_id SERIAL PRIMARY KEY,
                content_key VARCHAR(80) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                type VARCHAR(30) NOT NULL DEFAULT 'policy',
                body TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async getContentItems({ type, search }) {
        await this.ensureContentTable();
        const values = [];
        let idx = 1;
        let query = 'SELECT * FROM Content_Items WHERE 1=1';

        if (type) {
            query += ` AND type = $${idx++}`;
            values.push(type);
        }
        if (search) {
            query += ` AND (content_key ILIKE $${idx} OR title ILIKE $${idx} OR body ILIKE $${idx})`;
            values.push(`%${search}%`);
        }

        query += ' ORDER BY updated_at DESC, content_id DESC';
        const result = await pool.query(query, values);
        return result.rows;
    }

    async upsertContentItem(data, adminId = null) {
        await this.ensureContentTable();
        const { contentKey, title, type = 'policy', body = '', isActive = true } = data;
        if (!contentKey || !title) throw new Error('Content key va title la bat buoc');

        const result = await pool.query(
            `
                INSERT INTO Content_Items (content_key, title, type, body, is_active, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (content_key)
                DO UPDATE SET title = EXCLUDED.title,
                    type = EXCLUDED.type,
                    body = EXCLUDED.body,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
                RETURNING *
            `,
            [contentKey, title, type, body, Boolean(isActive)]
        );
        await logAction(adminId, 'UPSERT_CONTENT_ITEM', 'Content_Items', result.rows[0].content_id);
        return result.rows[0];
    }
}

module.exports = new AdminService();
