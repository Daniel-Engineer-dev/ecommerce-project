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

        // Cập nhật câu SQL: Lấy gộp dữ liệu Order, Voucher và Lịch sử phản hồi thành Object JSON
        let baseQuery = `
            SELECT c.*, u.username, u.email, cu.full_name,
                (SELECT content FROM Complaint_Responses WHERE complaint_id = c.complaint_id ORDER BY created_at DESC LIMIT 1) AS response_content,
                (SELECT action_type FROM Complaint_Responses WHERE complaint_id = c.complaint_id ORDER BY created_at DESC LIMIT 1) AS action_type,
                (
                    SELECT json_build_object(
                        'order_id', o.order_id,
                        'purchase_date', o.order_date,
                        'amount', o.total_amount,
                        'payment_status', o.status
                    )
                    FROM Orders o WHERE o.order_id = c.order_id
                ) AS "order",
                (
                    SELECT json_build_object(
                        'name', v.title,
                        'code', COALESCE(ev.unique_code, 'Không có mã'),
                        'usage_status', COALESCE(ev.status, 'Chưa xác định'),
                        'expiry_date', ev.expiry_date,
                        'quantity_stock', v.quantity_stock,
                        'sale_price', v.sale_price,
                        'voucher_expiry', v.expiry_date,
                        'evoucher_status', ev.status
                    )
                    FROM Complaint_Vouchers cv
                    JOIN Vouchers v ON cv.voucher_id = v.voucher_id
                    LEFT JOIN Order_Items oi ON oi.voucher_id = v.voucher_id AND oi.order_id = c.order_id
                    LEFT JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
                    WHERE cv.complaint_id = c.complaint_id
                    LIMIT 1
                ) AS voucher
            FROM Complaints c
            LEFT JOIN Users u ON c.customer_id = u.user_id
            LEFT JOIN Customers cu ON c.customer_id = cu.user_id
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

        // Bỏ GROUP BY vì đã xử lý ở dạng subquery vô hướng (scalar)
        const countResult = await pool.query(`SELECT COUNT(*) FROM (${baseQuery}) AS complaint_rows`, values);
        const total = parseInt(countResult.rows[0].count, 10);
        
        const dataResult = await pool.query(
            `${baseQuery} ORDER BY c.created_at DESC, c.complaint_id DESC LIMIT $${idx++} OFFSET $${idx++}`,
            [...values, Number(limit), offset]
        );

        return {
            complaints: dataResult.rows,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)) || 1,
        };
    }

    async updateComplaintStatus(complaintId, payload, adminId = null) {
        const { status, actionType, responseContent } = payload;
        const allowed = ['Pending', 'Processing', 'Resolved', 'Rejected'];
        
        if (!allowed.includes(status)) {
            throw new Error('Trạng thái khiếu nại không hợp lệ');
        }

        // 1. Kiểm tra Ngoại lệ E1
        const checkRes = await pool.query('SELECT status FROM Complaints WHERE complaint_id = $1', [complaintId]);
        if (checkRes.rowCount === 0) throw new Error('Khiếu nại không tồn tại');
        const currentStatus = checkRes.rows[0].status;

        if (['Resolved', 'Rejected'].includes(currentStatus)) {
            throw new Error('Lỗi E1: Không thể thay đổi trạng thái của khiếu nại đã Đã xử lý hoặc Từ chối.');
        }

        // 2. Kiểm tra quy tắc Luồng A & Luồng B
        if (status === 'Resolved' && (!actionType || !responseContent?.trim())) {
            throw new Error('Luồng A: Vui lòng chọn hướng giải quyết và nhập nội dung phản hồi.');
        }
        if (status === 'Rejected' && !responseContent?.trim()) {
            throw new Error('Luồng B: Bắt buộc phải nhập lý do từ chối.');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 3. Chỉ cập nhật status ở bảng Complaints
            await client.query(
                `UPDATE Complaints SET status = $1 WHERE complaint_id = $2`,
                [status, complaintId]
            );

            // 4. Lưu phản hồi và action_type vào Complaint_Responses
            if (responseContent?.trim()) {
                await client.query(
                    `INSERT INTO Complaint_Responses (complaint_id, responder_id, action_type, content)
                     VALUES ($1, $2, $3, $4)`,
                    [complaintId, adminId, actionType || null, responseContent.trim()]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        await logAction(adminId, `UPDATE_COMPLAINT_STATUS:${status}`, 'Complaints', complaintId);
        
        const updated = await pool.query('SELECT * FROM Complaints WHERE complaint_id = $1', [complaintId]);
        return updated.rows[0];
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

    /**
     * Lấy số lượng voucher đang hoạt động (status = 'Approved') và số khiếu nại chờ xử lý (status = 'Pending').
     * Dùng cho phần Stat Cards trên AdminDashboard.
     */
    async getVoucherAndComplaintStats() {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM Vouchers WHERE status = 'Approved')::int      AS active_vouchers,
                (SELECT COUNT(*) FROM Complaints WHERE status = 'Pending')::int     AS pending_complaints
        `);
        return result.rows[0];
    }

    /**
     * Trả về dữ liệu biểu đồ doanh thu (AreaChart) và cơ cấu tài khoản mới (BarChart)
     * được nhóm theo đơn vị thời gian: 'month' | 'quarter' | 'year'.
     *
     * - doanhThu   : Tổng doanh thu từ đơn hàng trạng thái 'Paid' (triệu VNĐ)
     * - voucher    : Tổng số lượng voucher item được bán ra trong các đơn 'Paid'
     * - customer   : Số tài khoản Customer đăng ký mới trong kỳ
     * - partner    : Số tài khoản Partner được Approved trong kỳ
     */
    async getDashboardChartData(unit = 'month') {
        const safeUnit = (unit ?? '').trim().toLowerCase();
        const validUnits = ['month', 'quarter', 'year'];
        if (!validUnits.includes(safeUnit)) throw new Error('Đơn vị thời gian không hợp lệ (month | quarter | year)');
        unit = safeUnit;

        // ── Cấu hình trục thời gian theo từng unit ──────────────────────────────
        // month   → 6 tháng gần nhất  (label: 'Tháng N/YYYY')
        // quarter → 4 quý gần nhất    (label: 'QN/YYYY')
        // year    → 3 năm gần nhất    (label: 'YYYY')
        let revenueSql, userSql;

        if (unit === 'month') {
            revenueSql = `
                SELECT
                    TO_CHAR(DATE_TRUNC('month', o.order_date), 'MM/YYYY')   AS label,
                    DATE_TRUNC('month', o.order_date)                        AS period_start,
                    ROUND(COALESCE(SUM(o.total_amount), 0) / 1000000, 2)    AS "doanhThu",
                    COALESCE(SUM(oi.quantity), 0)::int                       AS voucher
                FROM Orders o
                LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.status = 'Paid'
                  AND o.order_date >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
                GROUP BY DATE_TRUNC('month', o.order_date)
                ORDER BY period_start
            `;
            userSql = `
                SELECT
                    TO_CHAR(DATE_TRUNC('month', series.month), 'MM/YYYY') AS label,
                    series.month                                            AS period_start,
                    COUNT(DISTINCT CASE WHEN u.role = 'Customer' THEN u.user_id END)::int AS customer,
                    COUNT(DISTINCT CASE WHEN u.role = 'Partner'  AND p.status = 'Approved' THEN u.user_id END)::int AS partner
                FROM generate_series(
                    DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
                    DATE_TRUNC('month', NOW()),
                    INTERVAL '1 month'
                ) AS series(month)
                LEFT JOIN Users u
                    ON  DATE_TRUNC('month', u.create_at) = series.month
                    AND u.role IN ('Customer', 'Partner')
                LEFT JOIN Partners p ON p.user_id = u.user_id
                GROUP BY series.month
                ORDER BY series.month
            `;
        } else if (unit === 'quarter') {
            revenueSql = `
                SELECT
                    'Q' || TO_CHAR(DATE_TRUNC('quarter', o.order_date), 'Q/YYYY') AS label,
                    DATE_TRUNC('quarter', o.order_date)                             AS period_start,
                    ROUND(COALESCE(SUM(o.total_amount), 0) / 1000000, 2)           AS "doanhThu",
                    COALESCE(SUM(oi.quantity), 0)::int                              AS voucher
                FROM Orders o
                LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.status = 'Paid'
                  AND o.order_date >= DATE_TRUNC('quarter', NOW()) - INTERVAL '3 quarters'
                GROUP BY DATE_TRUNC('quarter', o.order_date)
                ORDER BY period_start
            `;
            userSql = `
                SELECT
                    'Q' || TO_CHAR(series.q, 'Q/YYYY')                             AS label,
                    series.q                                                         AS period_start,
                    COUNT(DISTINCT CASE WHEN u.role = 'Customer' THEN u.user_id END)::int AS customer,
                    COUNT(DISTINCT CASE WHEN u.role = 'Partner'  AND p.status = 'Approved' THEN u.user_id END)::int AS partner
                FROM generate_series(
                    DATE_TRUNC('quarter', NOW()) - INTERVAL '3 quarters',
                    DATE_TRUNC('quarter', NOW()),
                    INTERVAL '3 months'
                ) AS series(q)
                LEFT JOIN Users u
                    ON  DATE_TRUNC('quarter', u.create_at) = series.q
                    AND u.role IN ('Customer', 'Partner')
                LEFT JOIN Partners p ON p.user_id = u.user_id
                GROUP BY series.q
                ORDER BY series.q
            `;
        } else {
            // year
            revenueSql = `
                SELECT
                    TO_CHAR(DATE_TRUNC('year', o.order_date), 'YYYY')  AS label,
                    DATE_TRUNC('year', o.order_date)                     AS period_start,
                    ROUND(COALESCE(SUM(o.total_amount), 0) / 1000000, 2) AS "doanhThu",
                    COALESCE(SUM(oi.quantity), 0)::int                   AS voucher
                FROM Orders o
                LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.status = 'Paid'
                  AND o.order_date >= DATE_TRUNC('year', NOW()) - INTERVAL '2 years'
                GROUP BY DATE_TRUNC('year', o.order_date)
                ORDER BY period_start
            `;
            userSql = `
                SELECT
                    TO_CHAR(series.y, 'YYYY')                                       AS label,
                    series.y                                                          AS period_start,
                    COUNT(DISTINCT CASE WHEN u.role = 'Customer' THEN u.user_id END)::int AS customer,
                    COUNT(DISTINCT CASE WHEN u.role = 'Partner'  AND p.status = 'Approved' THEN u.user_id END)::int AS partner
                FROM generate_series(
                    DATE_TRUNC('year', NOW()) - INTERVAL '2 years',
                    DATE_TRUNC('year', NOW()),
                    INTERVAL '1 year'
                ) AS series(y)
                LEFT JOIN Users u
                    ON  DATE_TRUNC('year', u.create_at) = series.y
                    AND u.role IN ('Customer', 'Partner')
                LEFT JOIN Partners p ON p.user_id = u.user_id
                GROUP BY series.y
                ORDER BY series.y
            `;
        }

        const [revenueRes, userRes] = await Promise.all([
            pool.query(revenueSql),
            pool.query(userSql),
        ]);

        // Merge hai tập kết quả theo label (trục X đồng nhất nhờ generate_series phía user)
        const userMap = {};
        for (const row of userRes.rows) {
            userMap[row.label] = { customer: row.customer, partner: row.partner };
        }

        const revenueMap = {};
        for (const row of revenueRes.rows) {
            revenueMap[row.label] = { doanhThu: Number(row.doanhThu), voucher: row.voucher };
        }

        // Lấy danh sách label từ user (generate_series đảm bảo đủ kỳ kể cả kỳ 0 đơn hàng)
        const chartData = userRes.rows.map((row) => ({
            name: row.label,
            doanhThu: revenueMap[row.label]?.doanhThu ?? 0,
            voucher:  revenueMap[row.label]?.voucher  ?? 0,
            customer: row.customer,
            partner:  row.partner,
        }));

        return chartData;
    }

    async getContentByKey(key) {
        const result = await pool.query(
            `SELECT title, type, body, updated_at              
             FROM Content_Items              
             WHERE content_key = $1 AND is_active = TRUE`,
            [key]
        );

        if (result.rowCount === 0) {
            const error = new Error('Nội dung không tồn tại hoặc đã bị ẩn');
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    }
}

module.exports = new AdminService();