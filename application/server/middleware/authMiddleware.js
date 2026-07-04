const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getRequiredSecret } = require('../utils/jwtSecrets');

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access token is required.' });
    }

    try {
        const decoded = jwt.verify(token, getRequiredSecret('JWT_SECRET'));
        if (decoded.type === 'refresh') {
            return res.status(401).json({ message: 'Invalid access token.' });
        }

        const { rows } = await pool.query(
            `SELECT u.user_id, u.role, u.admin_scope, u.is_active AS admin_active,
                    c.is_active AS customer_active,
                    p.is_active AS partner_active,
                    p.status AS partner_status
             FROM Users u
             LEFT JOIN Customers c ON c.user_id = u.user_id
             LEFT JOIN Partners p ON p.user_id = u.user_id
             WHERE u.user_id = $1`,
            [decoded.id]
        );
        const user = rows[0];
        const inactive = !user
            || user.role !== decoded.role
            || (user.role === 'Customer' && user.customer_active === false)
            || (user.role === 'Partner' && (user.partner_active === false || user.partner_status !== 'Approved'))
            || (user.role === 'Admin' && user.admin_active === false);

        if (inactive) {
            return res.status(401).json({ message: 'Account is locked, unapproved, or no longer valid.' });
        }

        req.user = { ...decoded, role: user.role, scope: user.admin_scope || null };
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid access token.' });
    }
};

module.exports = auth;
