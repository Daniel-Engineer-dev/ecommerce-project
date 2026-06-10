const pool = require('../../config/db');
const { sendEmail } = require('../../utils/sendEmail');
const { logAction } = require('../../utils/systemLog');
const orderService = require('../customer/orderService');
const { contentTemplates, getContentTemplate } = require('../shared/contentDefinitions');

const COMPLAINT_STATUSES = ['Pending', 'Processing', 'Resolved', 'Rejected'];
const CLOSED_COMPLAINT_STATUSES = ['Resolved', 'Rejected'];

const sendNotificationEmail = async (mailOptions) => {
    try {
        await sendEmail(mailOptions);
        return { sent: true, error: null };
    } catch (error) {
        console.error('Partner notification email failed:', error.message);
        return { sent: false, error: error.message };
    }
};

const queueNotificationEmail = (mailOptions) => {
    setImmediate(() => {
        void sendNotificationEmail(mailOptions);
    });
};

class AdminService {
    async ensureComplaintWorkflowColumns() {
        return;
    }

    async assertOpenComplaint(complaintId, client = pool) {
        await this.ensureComplaintWorkflowColumns();
        const result = await client.query(
            `
                SELECT c.*, o.status AS order_status, o.total_amount AS order_total_amount
                FROM Complaints c
                LEFT JOIN Orders o ON o.order_id = c.order_id
                WHERE c.complaint_id = $1
                FOR UPDATE OF c
            `,
            [complaintId]
        );
        if (result.rowCount === 0) throw new Error('Khiếu nại không tồn tại');
        const complaint = result.rows[0];
        if (CLOSED_COMPLAINT_STATUSES.includes(complaint.status)) {
            throw new Error('Không thể thay đổi khiếu nại đã đóng');
        }
        return complaint;
    }

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
        const approval = await pool.query(
            "UPDATE Partners SET status = 'Approved' WHERE user_id = $1 AND status = 'Pending' RETURNING user_id",
            [id]
        );
        if (approval.rowCount === 0) throw new Error('Chi ho so dang cho duyet moi co the duoc phe duyet');
        const userRes = await pool.query(
            `SELECT u.email, u.username, p.company_name
             FROM Users u
             LEFT JOIN Partners p ON p.user_id = u.user_id
             WHERE u.user_id = $1`,
            [id]
        );
        const user = userRes.rows[0];
        let emailQueued = false;

        if (user && user.email) {
            const partnerUrl = process.env.PARTNER_URL || 'http://localhost:5174';
            const displayName = user.company_name || user.username;
            queueNotificationEmail({
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
            emailQueued = true;
        }

        await logAction(adminId, 'APPROVE_PARTNER', 'Partners', id);
        return { success: true, emailQueued };
    }

    async rejectPartner(id, adminId = null) {
        const rejection = await pool.query(
            "UPDATE Partners SET status = 'Rejected' WHERE user_id = $1 AND status = 'Pending' RETURNING user_id",
            [id]
        );
        if (rejection.rowCount === 0) throw new Error('Chi ho so dang cho duyet moi co the bi tu choi');
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];
        let emailQueued = false;

        if (user && user.email) {
            queueNotificationEmail({
                email: user.email,
                subject: 'Ho so doi tac bi tu choi',
                template: {
                    title: 'Ho so doi tac bi tu choi',
                    intro: `Xin chao ${user.username},`,
                    body: 'Ho so doi tac cua ban da bi tu choi. Vui long lien he bo phan ho tro de biet them chi tiet.',
                    footer: 'Dealzy se luon san sang ho tro ban hoan thien ho so.',
                },
            });
            emailQueued = true;
        }

        await logAction(adminId, 'REJECT_PARTNER', 'Partners', id);
        return { success: true, emailQueued };
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
        } else if (status === 'active') {
            baseQuery += ` AND (
                (u.role = 'Partner' AND p.is_active = TRUE) OR
                (u.role = 'Customer' AND c.is_active = TRUE)
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
        const { rows } = await pool.query('SELECT role FROM Users WHERE user_id = $1', [id]);
        if (rows.length === 0) throw new Error('Nguoi dung khong ton tai');
        if (rows[0].role !== newRole) {
            throw new Error('Khong the doi role truc tiep vi se lam mat nhat quan ho so va du lieu giao dich');
        }
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

    async toggleUserLock(id, _currentLockState, adminId = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userRes = await client.query('SELECT role FROM Users WHERE user_id = $1 FOR UPDATE', [id]);
            if (userRes.rowCount === 0) throw new Error('Nguoi dung khong ton tai');
            const { role } = userRes.rows[0];
            if (!['Partner', 'Customer'].includes(role)) throw new Error('Khong the khoa tai khoan nay');

            const targetTable = role === 'Partner' ? 'Partners' : 'Customers';
            const res = await client.query(
                `UPDATE ${targetTable} SET is_active = NOT COALESCE(is_active, true) WHERE user_id = $1 RETURNING is_active`,
                [id]
            );
            if (res.rowCount === 0) throw new Error(`Khong the cap nhat trang thai cho ${role}`);

            const newActiveState = res.rows[0].is_active;
            let suspendedVoucherCount = 0;
            if (role === 'Partner' && !newActiveState) {
                const suspended = await client.query(
                    "UPDATE Vouchers SET status = 'Suspended' WHERE partner_id = $1 AND status = 'Approved'",
                    [id]
                );
                suspendedVoucherCount = suspended.rowCount;
            }
            await client.query('COMMIT');
            await logAction(adminId, newActiveState ? 'UNLOCK_USER' : 'LOCK_USER', targetTable, id);
            return { success: true, is_active: newActiveState, role, suspendedVoucherCount };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
                COALESCE(oi_stats.item_count, 0)::int AS item_count,
                COALESCE(oi_stats.voucher_quantity, 0)::int AS voucher_quantity,
                COALESCE(ev_stats.evoucher_count, 0)::int AS evoucher_count
            FROM Orders o
            LEFT JOIN Users u ON o.customer_id = u.user_id
            LEFT JOIN Customers c ON o.customer_id = c.user_id
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
            GROUP BY o.order_id, u.username, u.email, c.full_name,
                oi_stats.item_count, oi_stats.voucher_quantity, ev_stats.evoucher_count
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
            const order = await pool.query('SELECT payment_method FROM Orders WHERE order_id = $1', [orderId]);
            if (order.rowCount === 0) throw new Error('Don hang khong ton tai');
            if (order.rows[0].payment_method !== 'VietQR') {
                throw new Error('Chi don VietQR moi duoc Admin xac nhan thanh toan thu cong');
            }
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
            if (currentStatus === status) {
                await client.query('COMMIT');
                return this.getOrderDetail(orderId);
            }
            if (['Cancelled', 'Failed', 'Expired', 'Refunded'].includes(currentStatus)) {
                throw new Error('Don hang da dong, khong the cap nhat trang thai');
            }
            if (status === 'Pending') {
                throw new Error('Khong the chuyen don hang ve Pending');
            }
            if (currentStatus === 'Paid' && ['Cancelled', 'Failed', 'Expired'].includes(status)) {
                throw new Error('Don hang da thanh toan chi co the chuyen sang Refunded');
            }
            if (status === 'Refunded' && currentStatus !== 'Paid') {
                throw new Error('Chi don hang da thanh toan moi co the hoan tien');
            }
            if (status === 'Refunded') {
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
            }

            if (currentStatus === 'Pending' && ['Cancelled', 'Failed', 'Expired'].includes(status)) {
                await orderService.restoreStockForOrder(client, orderId);
            }

            if (status === 'Refunded') {
                await orderService.restoreStockForOrder(client, orderId);
                await client.query(
                    `
                        UPDATE E_Vouchers ev
                        SET status = 'Locked'
                        FROM Order_Items oi
                        WHERE ev.order_item_id = oi.order_item_id
                            AND oi.order_id = $1
                            AND ev.status <> 'Locked'
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
        await this.ensureComplaintWorkflowColumns();
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
        await this.ensureComplaintWorkflowColumns();
        const { status, actionType, responseContent } = payload;
        const allowed = COMPLAINT_STATUSES;
        
        if (!allowed.includes(status)) {
            throw new Error('Trạng thái khiếu nại không hợp lệ');
        }

        // 1. Kiểm tra Ngoại lệ E1
        const checkRes = await pool.query('SELECT status FROM Complaints WHERE complaint_id = $1', [complaintId]);
        if (checkRes.rowCount === 0) throw new Error('Khiếu nại không tồn tại');
        const currentStatus = checkRes.rows[0].status;

        if (CLOSED_COMPLAINT_STATUSES.includes(currentStatus)) {
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
            await this.assertOpenComplaint(complaintId, client);

            const updateResult = await client.query(
                `
                    UPDATE Complaints
                    SET status = $1::varchar,
                        resolution_type = CASE
                            WHEN $1::varchar = 'Rejected' THEN 'reject'
                            WHEN $2::varchar = 'Refund' THEN 'refund_manual'
                            WHEN $2::varchar = 'NewCode' THEN 'voucher'
                            WHEN $2::varchar = 'Other' THEN 'other'
                            ELSE resolution_type
                        END,
                        refund_status = CASE
                            WHEN $1::varchar = 'Resolved' AND $2::varchar = 'Refund' THEN 'pending_manual'
                            ELSE refund_status
                        END,
                        resolution_note = COALESCE($3::text, resolution_note),
                        reviewed_by = $4::integer,
                        reviewed_at = NOW(),
                        resolved_at = CASE WHEN $1::varchar IN ('Resolved', 'Rejected') THEN NOW() ELSE resolved_at END,
                        updated_at = NOW()
                    WHERE complaint_id = $5
                      AND status NOT IN ('Resolved', 'Rejected')
                    RETURNING complaint_id
                `,
                [status, actionType || null, responseContent?.trim() || null, adminId, complaintId]
            );
            if (updateResult.rowCount === 0) {
                throw new Error('Khong the cap nhat khieu nai da dong');
            }

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

    async issueComplaintVoucher(complaintId, payload = {}, adminId = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const complaint = await this.assertOpenComplaint(complaintId, client);
            if (!complaint.order_id) throw new Error('Khiếu nại chưa gắn với đơn hàng nên không thể cấp voucher mới');

            const itemRes = await client.query(
                `
                    SELECT oi.order_item_id, oi.voucher_id, v.expiry_date
                    FROM Order_Items oi
                    JOIN Vouchers v ON v.voucher_id = oi.voucher_id
                    LEFT JOIN Complaint_Vouchers cv
                        ON cv.voucher_id = oi.voucher_id AND cv.complaint_id = $2
                    WHERE oi.order_id = $1
                    ORDER BY CASE WHEN cv.voucher_id IS NOT NULL THEN 0 ELSE 1 END, oi.order_item_id
                    LIMIT 1
                `,
                [complaint.order_id, complaintId]
            );
            if (itemRes.rowCount === 0) throw new Error('Không tìm thấy voucher trong đơn hàng liên quan');

            const item = itemRes.rows[0];

            let issued;
            for (let attempts = 0; attempts < 5; attempts++) {
                try {
                    const replacementRes = await client.query(
                        `
                            UPDATE E_Vouchers
                            SET unique_code = $2,
                                expiry_date = COALESCE($3::timestamp, $4::timestamp),
                                issued_at = NOW()
                            WHERE evoucher_id = (
                                SELECT evoucher_id
                                FROM E_Vouchers
                                WHERE order_item_id = $1 AND status = 'Unused'
                                ORDER BY evoucher_id
                                LIMIT 1
                                FOR UPDATE
                            )
                            RETURNING *
                        `,
                        [
                            item.order_item_id,
                            orderService.generateUniqueCode(),
                            payload.expired_at || payload.expiryDate || null,
                            item.expiry_date,
                        ]
                    );
                    issued = replacementRes.rows[0];
                    break;
                } catch (error) {
                    if (error.code !== '23505') throw error;
                }
            }
            if (!issued) throw new Error('Không có mã e-voucher chưa sử dụng để thay thế');

            await client.query(
                `
                    INSERT INTO Complaint_Vouchers (complaint_id, voucher_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `,
                [complaintId, item.voucher_id]
            );

            const note = payload.note || `Đã cấp e-voucher mới: ${issued.unique_code}`;
            await client.query(
                `
                    UPDATE Complaints
                    SET status = 'Resolved',
                        resolution_type = 'voucher',
                        resolution_note = $1,
                        voucher_id = $2,
                        reviewed_by = $3::integer,
                        reviewed_at = NOW(),
                        resolved_at = NOW(),
                        updated_at = NOW()
                    WHERE complaint_id = $4
                `,
                [note, item.voucher_id, adminId, complaintId]
            );

            await client.query(
                `
                    INSERT INTO Complaint_Responses (complaint_id, responder_id, action_type, content)
                    VALUES ($1, $2, 'NewCode', $3::text)
                `,
                [complaintId, adminId, note]
            );

            await client.query('COMMIT');
            await logAction(adminId, 'ISSUE_COMPLAINT_VOUCHER', 'Complaints', complaintId);
            return { evoucher: issued, voucherId: item.voucher_id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async markComplaintRefundPending(complaintId, payload = {}, adminId = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const complaint = await this.assertOpenComplaint(complaintId, client);
            const amount = Number(payload.refund_amount ?? payload.refundAmount ?? complaint.order_total_amount ?? 0);
            const orderTotal = Number(complaint.order_total_amount || 0);
            if (!Number.isFinite(amount) || amount <= 0 || (complaint.order_id && amount > orderTotal)) {
                throw new Error('So tien hoan khong hop le hoac vuot qua tong don hang');
            }
            const note = payload.note || 'Đã duyệt hoàn tiền thủ công, chờ xử lý bên ngoài hệ thống';

            const result = await client.query(
                `
                    UPDATE Complaints
                    SET status = 'Processing',
                        resolution_type = 'refund_manual',
                        refund_status = 'pending_manual',
                        refund_amount = $1::numeric,
                        resolution_note = $2::text,
                        reviewed_by = $3::integer,
                        reviewed_at = NOW(),
                        updated_at = NOW()
                    WHERE complaint_id = $4
                    RETURNING *
                `,
                [amount, note, adminId, complaintId]
            );
            await client.query(
                `
                    INSERT INTO Complaint_Responses (complaint_id, responder_id, action_type, content)
                    VALUES ($1, $2, 'Refund', $3::text)
                `,
                [complaintId, adminId, note]
            );
            await client.query('COMMIT');
            await logAction(adminId, 'MARK_COMPLAINT_REFUND_PENDING', 'Complaints', complaintId);
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async markComplaintRefunded(complaintId, payload = {}, adminId = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const complaint = await this.assertOpenComplaint(complaintId, client);
            const amount = Number(payload.refund_amount ?? payload.refundAmount ?? complaint.refund_amount ?? complaint.order_total_amount ?? 0);
            const orderTotal = Number(complaint.order_total_amount || 0);
            if (!Number.isFinite(amount) || amount <= 0 || (complaint.order_id && amount > orderTotal)) {
                throw new Error('So tien hoan khong hop le hoac vuot qua tong don hang');
            }
            const note = payload.note || 'Đã hoàn tiền thủ công';

            if (complaint.order_id && amount === orderTotal) {
                const order = await client.query(
                    'SELECT status FROM Orders WHERE order_id = $1 FOR UPDATE',
                    [complaint.order_id]
                );
                if (order.rows[0]?.status !== 'Paid') {
                    throw new Error('Chi don hang Paid moi co the hoan toan bo');
                }
                const usedVoucher = await client.query(
                    `SELECT 1
                     FROM E_Vouchers ev
                     JOIN Order_Items oi ON oi.order_item_id = ev.order_item_id
                     WHERE oi.order_id = $1 AND ev.status = 'Used'
                     LIMIT 1`,
                    [complaint.order_id]
                );
                if (usedVoucher.rows.length > 0) {
                    throw new Error('Khong the hoan toan bo don hang da su dung voucher');
                }
                await orderService.restoreStockForOrder(client, complaint.order_id);
                await client.query(
                    `UPDATE E_Vouchers ev
                     SET status = 'Locked'
                     FROM Order_Items oi
                     WHERE ev.order_item_id = oi.order_item_id
                       AND oi.order_id = $1
                       AND ev.status <> 'Locked'`,
                    [complaint.order_id]
                );
                await client.query("UPDATE Orders SET status = 'Refunded' WHERE order_id = $1", [complaint.order_id]);
            }

            const result = await client.query(
                `
                    UPDATE Complaints
                    SET status = 'Resolved',
                        resolution_type = 'refund_manual',
                        refund_status = 'completed_manual',
                        refund_amount = $1::numeric,
                        resolution_note = $2::text,
                        reviewed_by = COALESCE(reviewed_by, $3::integer),
                        reviewed_at = COALESCE(reviewed_at, NOW()),
                        resolved_at = NOW(),
                        updated_at = NOW()
                    WHERE complaint_id = $4
                    RETURNING *
                `,
                [amount, note, adminId, complaintId]
            );
            await client.query(
                `
                    INSERT INTO Complaint_Responses (complaint_id, responder_id, action_type, content)
                    VALUES ($1, $2, 'RefundCompleted', $3::text)
                `,
                [complaintId, adminId, note]
            );
            await client.query('COMMIT');
            await logAction(adminId, 'MARK_COMPLAINT_REFUNDED', 'Complaints', complaintId);
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
            SELECT l.*,
                to_char(l.created_at + interval '7 hours', 'HH24:MI:SS DD/MM/YYYY') AS created_at_vn,
                u.username, u.email, u.role
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
        return;
    }

    getContentTemplates() {
        return contentTemplates.map(({ key, label, template, type, slug, title, summary }) => ({
            key,
            label,
            template,
            type,
            slug,
            title,
            summary,
        }));
    }

    buildDefaultContent(key) {
        const definition = getContentTemplate(key);
        if (!definition) return null;
        return {
            content_id: null,
            content_key: definition.key,
            title: definition.title,
            type: definition.type,
            body: '',
            is_active: true,
            slug: definition.slug,
            summary: definition.summary,
            thumbnail_url: null,
            status: 'published',
            published_at: null,
            template: definition.template,
            data: definition.data,
            version: 0,
            last_action: 'default',
            label: definition.label,
        };
    }

    async getContentItemByKey(contentKey) {
        await this.ensureContentTable();
        const result = await pool.query(
            'SELECT * FROM Content_Items WHERE content_key = $1',
            [contentKey]
        );
        if (result.rowCount === 0) {
            const fallback = this.buildDefaultContent(contentKey);
            if (!fallback) {
                const error = new Error('Content template not found');
                error.statusCode = 404;
                throw error;
            }
            return fallback;
        }
        const row = result.rows[0];
        const definition = getContentTemplate(row.content_key);
        return {
            ...row,
            data: row.data && Object.keys(row.data).length ? row.data : definition?.data || {},
            label: definition?.label || row.title,
        };
    }

    async writeContentRevision(client, beforeRow, afterRow, action, adminId) {
        await client.query(
            `
                INSERT INTO Content_Item_Revisions (
                    content_id, content_key, action, before_data, after_data,
                    before_status, after_status, changed_by
                )
                VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8)
            `,
            [
                afterRow.content_id,
                afterRow.content_key,
                action,
                beforeRow ? JSON.stringify(beforeRow.data || {}) : null,
                JSON.stringify(afterRow.data || {}),
                beforeRow?.status || null,
                afterRow.status,
                adminId || null,
            ]
        );
    }

    async updatePublishedSnapshot(client, row) {
        if (row.status !== 'published' || row.is_active !== true) return row;
        const result = await client.query(
            `
                UPDATE Content_Items
                SET published_title = title,
                    published_summary = summary,
                    published_body = body,
                    published_template = template,
                    published_data = data,
                    published_version = version,
                    published_at = COALESCE(published_at, NOW())
                WHERE content_id = $1
                RETURNING *
            `,
            [row.content_id]
        );
        return result.rows[0] || row;
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
        const {
            contentKey,
            title,
            type = 'policy',
            body = '',
            isActive = true,
            slug,
            summary = '',
            thumbnailUrl = null,
            status,
            publishedAt = null,
            template,
            data: structuredData,
        } = data;
        if (!contentKey || !title) throw new Error('Content key va title la bat buoc');
        const definition = getContentTemplate(contentKey);
        const publicStatus = status || (isActive ? 'published' : 'archived');
        const normalizedSlug = (slug || contentKey).trim().toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-')
            .replace(/^-+|-+$/g, '') || contentKey;

        const result = await pool.query(
            `
                INSERT INTO Content_Items (
                    content_key, title, type, body, is_active, slug, summary,
                    thumbnail_url, status, published_at, created_by, updated_by,
                    template, data, version, last_action, updated_at
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    COALESCE($10::timestamp, NOW()), $11::integer, $11::integer,
                    $12, $13::jsonb, 1, 'upsert', NOW()
                )
                ON CONFLICT (content_key)
                DO UPDATE SET title = EXCLUDED.title,
                    type = EXCLUDED.type,
                    body = EXCLUDED.body,
                    is_active = EXCLUDED.is_active,
                    slug = EXCLUDED.slug,
                    summary = EXCLUDED.summary,
                    thumbnail_url = EXCLUDED.thumbnail_url,
                    status = EXCLUDED.status,
                    published_at = EXCLUDED.published_at,
                    updated_by = EXCLUDED.updated_by,
                    template = EXCLUDED.template,
                    data = EXCLUDED.data,
                    version = COALESCE(Content_Items.version, 1) + 1,
                    last_action = 'upsert',
                    updated_at = NOW()
                RETURNING *
            `,
            [
                contentKey,
                title,
                type,
                body,
                Boolean(isActive),
                normalizedSlug,
                summary,
                thumbnailUrl,
                publicStatus,
                publishedAt,
                adminId,
                template || definition?.template || type,
                JSON.stringify(structuredData || definition?.data || {}),
            ]
        );
        const snapshotClient = {
            query: (...args) => pool.query(...args),
        };
        const saved = await this.updatePublishedSnapshot(snapshotClient, result.rows[0]);
        await logAction(adminId, 'UPSERT_CONTENT_ITEM', 'Content_Items', saved.content_id);
        return saved;
    }

    async updateContentItemByKey(contentKey, payload, adminId = null, action = 'UPDATE_CONTENT_ITEM') {
        await this.ensureContentTable();
        const definition = getContentTemplate(contentKey);
        if (!definition) {
            const error = new Error('Content template not found');
            error.statusCode = 404;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const beforeRes = await client.query(
                'SELECT * FROM Content_Items WHERE content_key = $1 FOR UPDATE',
                [contentKey]
            );
            const beforeRow = beforeRes.rows[0] || null;
            const nextStatus = payload.status || (payload.isActive === false ? 'archived' : 'published');
            const nextData = payload.data || beforeRow?.data || definition.data;
            const nextTitle = payload.title || beforeRow?.title || definition.title;
            const nextType = payload.type || beforeRow?.type || definition.type;
            const nextSummary = payload.summary ?? beforeRow?.summary ?? definition.summary;
            const nextSlug = payload.slug || beforeRow?.slug || definition.slug;
            const nextTemplate = payload.template || beforeRow?.template || definition.template;
            const nextBody = payload.body ?? beforeRow?.body ?? '';
            const nextIsActive = payload.isActive ?? payload.is_active ?? nextStatus === 'published';
            const nextPublishedAt = payload.publishedAt || payload.published_at || beforeRow?.published_at || null;
            const dbAction = nextStatus === 'archived'
                ? 'ARCHIVE_CONTENT_ITEM'
                : action;

            const result = await client.query(
                `
                    INSERT INTO Content_Items (
                        content_key, title, type, body, is_active, slug, summary,
                        thumbnail_url, status, published_at, created_by, updated_by,
                        template, data, version, last_action, updated_at
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9,
                        COALESCE($10::timestamp, NOW()), $11::integer, $11::integer,
                        $12, $13::jsonb, 1, $14, NOW()
                    )
                    ON CONFLICT (content_key)
                    DO UPDATE SET title = EXCLUDED.title,
                        type = EXCLUDED.type,
                        body = EXCLUDED.body,
                        is_active = EXCLUDED.is_active,
                        slug = EXCLUDED.slug,
                        summary = EXCLUDED.summary,
                        thumbnail_url = EXCLUDED.thumbnail_url,
                        status = EXCLUDED.status,
                        published_at = EXCLUDED.published_at,
                        updated_by = EXCLUDED.updated_by,
                        template = EXCLUDED.template,
                        data = EXCLUDED.data,
                        version = COALESCE(Content_Items.version, 1) + 1,
                        last_action = EXCLUDED.last_action,
                        updated_at = NOW()
                    RETURNING *
                `,
                [
                    contentKey,
                    nextTitle,
                    nextType,
                    nextBody,
                    Boolean(nextIsActive),
                    nextSlug,
                    nextSummary,
                    payload.thumbnailUrl || payload.thumbnail_url || beforeRow?.thumbnail_url || null,
                    nextStatus,
                    nextPublishedAt,
                    adminId,
                    nextTemplate,
                    JSON.stringify(nextData),
                    dbAction,
                ]
            );
            let afterRow = result.rows[0];
            afterRow = await this.updatePublishedSnapshot(client, afterRow);
            await this.writeContentRevision(client, beforeRow, afterRow, dbAction, adminId);
            await client.query('COMMIT');
            await logAction(adminId, dbAction, 'Content_Items', afterRow.content_id);
            return afterRow;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async publishContentItem(contentKey, adminId = null) {
        const current = await this.getContentItemByKey(contentKey);
        return this.updateContentItemByKey(contentKey, {
            ...current,
            status: 'published',
            isActive: true,
            data: current.data,
            publishedAt: new Date().toISOString(),
        }, adminId, 'PUBLISH_CONTENT_ITEM');
    }

    async archiveContentItem(contentKey, adminId = null) {
        const current = await this.getContentItemByKey(contentKey);
        return this.updateContentItemByKey(contentKey, {
            ...current,
            status: 'archived',
            isActive: false,
            data: current.data,
        }, adminId, 'ARCHIVE_CONTENT_ITEM');
    }

    async resetContentItem(contentKey, adminId = null) {
        const definition = getContentTemplate(contentKey);
        if (!definition) {
            const error = new Error('Content template not found');
            error.statusCode = 404;
            throw error;
        }
        return this.updateContentItemByKey(contentKey, {
            title: definition.title,
            type: definition.type,
            slug: definition.slug,
            summary: definition.summary,
            template: definition.template,
            data: definition.data,
            status: 'published',
            isActive: true,
        }, adminId, 'RESET_CONTENT_ITEM');
    }

    async getContentRevisions(contentKey) {
        await this.ensureContentTable();
        const result = await pool.query(
            `
                SELECT r.*, u.username, u.email
                FROM Content_Item_Revisions r
                LEFT JOIN Users u ON u.user_id = r.changed_by
                WHERE r.content_key = $1
                ORDER BY r.changed_at DESC, r.revision_id DESC
                LIMIT 50
            `,
            [contentKey]
        );
        return result.rows;
    }

    async getPublicContentItems({ type, search, limit = 50 }) {
        await this.ensureContentTable();
        const values = [];
        let idx = 1;
        let query = `
            SELECT content_id, content_key, title, slug, summary, type, body,
                thumbnail_url, template, data, version, published_at, updated_at
            FROM Content_Items
            WHERE is_active = TRUE
                AND status = 'published'
                AND COALESCE(published_at, updated_at, NOW()) <= NOW()
        `;

        if (type) {
            query += ` AND type = $${idx++}`;
            values.push(type);
        }
        if (search) {
            query += ` AND (title ILIKE $${idx} OR summary ILIKE $${idx} OR body ILIKE $${idx})`;
            values.push(`%${search}%`);
            idx++;
        }

        query += ` ORDER BY published_at DESC NULLS LAST, updated_at DESC LIMIT $${idx++}`;
        values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
        const result = await pool.query(query, values);
        return result.rows;
    }

    async getPublicContentBySlug(slug) {
        await this.ensureContentTable();
        const result = await pool.query(
            `
                SELECT *
                FROM Content_Items
                WHERE slug = $1::varchar OR content_key = $1::varchar
                LIMIT 1
            `,
            [slug]
        );
        if (result.rowCount === 0) {
            const error = new Error('Nội dung không tồn tại hoặc chưa được publish');
            error.statusCode = 404;
            throw error;
        }

        const row = result.rows[0];
        if (row.status === 'archived') {
            const error = new Error('Nội dung đã bị quản trị viên tạm ẩn');
            error.statusCode = 423;
            error.hidden = true;
            error.item = {
                content_id: row.content_id,
                content_key: row.content_key,
                title: row.title,
                slug: row.slug,
                status: row.status,
                is_active: row.is_active,
                template: row.template,
            };
            throw error;
        }

        if (row.published_data && Object.keys(row.published_data).length > 0) {
            return {
                content_id: row.content_id,
                content_key: row.content_key,
                title: row.published_title || row.title,
                slug: row.slug,
                summary: row.published_summary || row.summary,
                type: row.type,
                body: row.published_body || row.body,
                thumbnail_url: row.thumbnail_url,
                template: row.published_template || row.template,
                data: row.published_data,
                version: row.published_version || row.version,
                published_at: row.published_at,
                updated_at: row.updated_at,
            };
        }

        if (row.status === 'published' && row.is_active === true) {
            return row;
        }

        const error = new Error('Nội dung không tồn tại hoặc chưa được publish');
        error.statusCode = 404;
        throw error;
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
