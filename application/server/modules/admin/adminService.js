const pool = require('../../config/db');
const { sendEmail } = require('../../utils/sendEmail');

class AdminService {
    async getPendingPartners() {
        const query = `
            SELECT u.user_id, u.username, u.email, u.phone,
                   p.company_name, p.representative_name, p.tax_id, p.headquarters, p.status
            FROM Users u
            JOIN Partners p ON u.user_id = p.user_id
            WHERE p.status = 'Pending'
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async approvePartner(id) {
        await pool.query("UPDATE Partners SET status = 'Approved' WHERE user_id = $1", [id]);
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];

        if (user && user.email) {
            const partnerUrl = process.env.PARTNER_URL || 'http://localhost:5174';
            await sendEmail({
                email: user.email,
                subject: 'Tai khoan da phe duyet',
                template: {
                    title: 'Tai khoan doi tac da duoc phe duyet',
                    intro: `Xin chuc mung ${user.username}!`,
                    body: 'Tai khoan cua ban da duoc phe duyet va hien da san sang de su dung.',
                    buttonText: 'Truy cap trang doi tac',
                    buttonUrl: partnerUrl,
                    footer: 'Cam on ban da dong hanh cung Dealzy.',
                },
            });
        }

        return { success: true };
    }

    async rejectPartner(id) {
        await pool.query("UPDATE Partners SET status = 'Rejected' WHERE user_id = $1", [id]);
        const userRes = await pool.query("SELECT email, username FROM Users WHERE user_id = $1", [id]);
        const user = userRes.rows[0];

        if (user && user.email) {
            await sendEmail({
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

        return { success: true };
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
            return { ...user, details: partnerRes.rows[0] || null };
        }

        if (user.role === 'Customer') {
            const customerRes = await pool.query(
                `SELECT full_name, dob, address, is_active
                 FROM Customers WHERE user_id = $1`,
                [id]
            );
            return { ...user, details: customerRes.rows[0] || null };
        }

        return user;
    }

    async changeUserRole(id, newRole) {
        if (!['Customer', 'Partner', 'Admin'].includes(newRole)) {
            throw new Error('Role khong hop le');
        }
        await pool.query('UPDATE Users SET role = $1 WHERE user_id = $2', [newRole, id]);
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

    async toggleUserLock(id, currentLockState) {
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
        return { success: true, is_active: newActiveState, role };
    }
}

module.exports = new AdminService();
