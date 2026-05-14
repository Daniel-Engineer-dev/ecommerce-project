const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

class AdminService {
    async getPendingPartners() {
        const query = `
            SELECT u.user_id, u.username, u.email, u.phone, p.company_name, p.representative_name, p.tax_id, p.headquarters, p.status
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
            const html = `<h2>Chúc mừng!</h2><p>Tài khoản của bạn đã được phê duyệt. <a href="${partnerUrl}">Truy cập ngay</a></p>`;
            await sendEmail({ email: user.email, subject: 'Tài khoản đã phê duyệt', html });
        }
        
        return { success: true };
    }
}

module.exports = new AdminService();
