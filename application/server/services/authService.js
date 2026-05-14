const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async registerPartner(data) {
        const client = await pool.connect();
        try {
            const { username, password, email, phone, company_name, representative_name, tax_id, headquarters } = data;

            // Kiểm tra username, email, phone... (giản lược cho ví dụ)
            const hashedPassword = await bcrypt.hash(password, 10);

            await client.query('BEGIN');
            
            const newUser = await client.query(
                'INSERT INTO Users (username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
                [username, hashedPassword, email, phone, 'Partner']
            );
            
            const userId = newUser.rows[0].user_id;
            
            await client.query(
                'INSERT INTO Partners (user_id, company_name, representative_name, tax_id, headquarters) VALUES ($1, $2, $3, $4, $5)',
                [userId, company_name, representative_name, tax_id, headquarters]
            );

            await client.query('COMMIT');
            return newUser.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async login(username, password) {
        const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (result.rows.length === 0) throw new Error("Tài khoản không tồn tại");

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Mật khẩu không chính xác");

        // Kiểm tra trạng thái nếu là Partner
        if (user.role === 'Partner') {
            const partnerRes = await pool.query('SELECT status FROM Partners WHERE user_id = $1', [user.user_id]);
            if (partnerRes.rows[0].status === 'Pending') throw new Error("Tài khoản đang chờ xét duyệt");
        }

        const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secretkey_tmdt', { expiresIn: '1d' });
        return { token, user: { id: user.user_id, username: user.username, role: user.role } };
    }
}

module.exports = new AuthService();
