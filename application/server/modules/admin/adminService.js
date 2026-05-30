const pool = require('../../config/db');
const sendEmail = require('../../utils/sendEmail');

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

    /**
     * Phê duyệt đối tác và gửi email thông báo tự động (BR-ADM-02)
     */
    async approvePartner(id) {
        await pool.query("UPDATE Partners SET status = 'Approved', is_active = true WHERE user_id = $1", [id]);
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];

        if (user && user.email) {
            const partnerUrl = process.env.PARTNER_URL || 'http://localhost:5174';
            const html = `
                <h2>Chúc mừng!</h2>
                <p>Tài khoản đối tác doanh nghiệp <b>${user.username}</b> của bạn đã được phê duyệt thành công.</p>
                <p><a href="${partnerUrl}">Truy cập hệ thống Đối tác để bắt đầu tạo chương trình Voucher ngay</a></p>
            `;
            await sendEmail({ email: user.email, subject: '[Dealzy] Tài khoản đối tác đã phê duyệt', html });
        }
        return { success: true };
    }

    /**
     * Từ chối hồ sơ đối tác đăng ký (BR-ADM-02)
     */
    async rejectPartner(id) {
        await pool.query("UPDATE Partners SET status = 'Rejected', is_active = false WHERE user_id = $1", [id]);
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];

        if (user && user.email) {
            const html = `
                <h2>Thông báo thẩm định hồ sơ</h2>
                <p>Chào bạn, hồ sơ đối tác doanh nghiệp của bạn đã bị từ chối do thông tin chưa chính xác hoặc mã số thuế vi phạm.</p>
                <p>Vui lòng đăng ký lại hồ sơ hoặc liên hệ quản trị viên để giải quyết khiếu nại.</p>
            `;
            await sendEmail({ email: user.email, subject: '[Dealzy] Hồ sơ đối tác bị từ chối', html });
        }
        return { success: true };
    }

    /**
     * Lấy danh sách tất cả người dùng (Customer + Partner), hỗ trợ lọc theo role, search và status khóa
     */
    async getAllUsers({ role, search, status, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
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
                -- Lấy trạng thái hoạt động linh hoạt từ cả 2 bảng nghiệp vụ
                CASE
                    WHEN u.role = 'Partner' THEN p.is_active
                    WHEN u.role = 'Customer' THEN c.is_active
                    ELSE TRUE
                END AS is_active
            FROM Users u
            LEFT JOIN Customers c ON u.user_id = c.user_id
            LEFT JOIN Partners  p ON u.user_id = p.user_id
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
                u.username    ILIKE $${idx}   OR
                u.email       ILIKE $${idx}   OR
                u.phone       ILIKE $${idx}   OR
                c.full_name   ILIKE $${idx}   OR
                p.company_name ILIKE $${idx}
            )`;
            values.push(`%${search}%`);
            idx++;
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM (${baseQuery}) AS sub`,
            values
        );
        const total = parseInt(countResult.rows[0].count);

        baseQuery += ` ORDER BY u.user_id DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(limit, offset);

        const result = await pool.query(baseQuery, values);
        return {
            users: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Xem chi tiết thông tin 1 người dùng (Làm phẳng cấu trúc dữ liệu để React render ngay)
     */
    async getUserById(id) {
        const userRes = await pool.query(
            'SELECT user_id, username, email, phone, role FROM Users WHERE user_id = $1',
            [id]
        );
        if (userRes.rows.length === 0) throw new Error('Người dùng không tồn tại');
        const user = userRes.rows[0];

        if (user.role === 'Partner') {
            const partnerRes = await pool.query(
                `SELECT company_name, representative_name, tax_id, headquarters, status, is_active 
                 FROM Partners WHERE user_id = $1`,
                [id]
            );
            const branchesRes = await pool.query('SELECT * FROM Branches WHERE partner_id = $1', [id]);
            return { ...user, ...partnerRes.rows[0], branches: branchesRes.rows };
        } else if (user.role === 'Customer') {
            const customerRes = await pool.query(
                `SELECT full_name, dob, address, is_active 
                 FROM Customers WHERE user_id = $1`,
                [id]
            );
            return { ...user, ...customerRes.rows[0] };
        }
        return user;
    }

    /**
     * Đổi vai trò tài khoản
     */
    async changeUserRole(id, newRole) {
        if (!['Customer', 'Partner', 'Admin'].includes(newRole)) {
            throw new Error('Role không hợp lệ');
        }
        await pool.query(`UPDATE Users SET role = $1 WHERE user_id = $2`, [newRole, id]);
        return { success: true };
    }

    /**
     * Thống kê tổng hợp số liệu Dashboard Mini
     */
    async getUserStats() {
        const result = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE role = 'Customer') AS total_customers,
                COUNT(*) FILTER (WHERE role = 'Partner')  AS total_partners,
                COUNT(*) AS total_users
            FROM Users
            WHERE role <> 'Admin'
        `);
        const partnerStats = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'Pending')  AS pending,
                COUNT(*) FILTER (WHERE is_active = false)   AS locked
            FROM Partners
        `);
        return { ...result.rows[0], ...partnerStats.rows[0] };
    }

    /**
     * Logic Khóa / Mở khóa dùng chung cho cả Customer và Partner (BR-ADM-02)
     */
    async toggleUserLock(id, currentLockState) {
        const userRes = await pool.query('SELECT role FROM Users WHERE user_id = $1', [id]);
        if (userRes.rowCount === 0) throw new Error('Người dùng không tồn tại');
        const { role } = userRes.rows[0];

        const targetTable = role === 'Partner' ? 'Partners' : 'Customers';
        const newActiveState = currentLockState; 

        const res = await pool.query(
            `UPDATE ${targetTable} SET is_active = $1 WHERE user_id = $2 RETURNING user_id`,
            [newActiveState, id]
        );
        
        if (res.rowCount === 0) throw new Error(`Không thể cập nhật trạng thái cho ${role}`);
        return { success: true, is_active: newActiveState, role };
    }
}

module.exports = new AdminService();