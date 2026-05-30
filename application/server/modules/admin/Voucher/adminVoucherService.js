const pool = require('../../../config/db');
const { logAction } = require('../../../utils/systemLog');

class AdminVoucherService {
    async getAdminVouchers({ status, search, page = 1, limit = 10 }) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const offset = (pageNumber - 1) * limitNumber;
        const values = [];
        let idx = 1;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Users u ON p.user_id = u.user_id
            WHERE 1=1
        `;

        let dataQuery = `
            SELECT v.*, p.company_name, u.email as partner_email
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Users u ON p.user_id = u.user_id
            WHERE 1=1
        `;

        let filterQuery = '';
        if (status) {
            filterQuery += ` AND v.status = $${idx++}`;
            values.push(status);
        }

        if (search && search.trim() !== '') {
            filterQuery += ` AND (
<<<<<<< HEAD:application/server/modules/admin/Voucher/adminVoucherService.js
                v.title                 ILIKE $${idx} OR 
                p.company_name          ILIKE $${idx} OR 
                v.voucher_id::TEXT      ILIKE $${idx} OR
                v.partner_id::TEXT      ILIKE $${idx}
=======
                v.title ILIKE $${idx} OR
                p.company_name ILIKE $${idx} OR
                v.voucher_id::TEXT ILIKE $${idx}
>>>>>>> customer:application/server/modules/admin/adminVoucher/adminVoucherService.js
            )`;
            values.push(`%${search.trim()}%`);
            idx++;
        }

        countQuery += filterQuery;
        dataQuery += `${filterQuery} ORDER BY v.start_date DESC LIMIT $${idx++} OFFSET $${idx++}`;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, values),
            pool.query(dataQuery, [...values, limitNumber, offset]),
        ]);

        const totalItems = parseInt(countResult.rows[0].total, 10);
        return {
            vouchers: dataResult.rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limitNumber) || 1,
                currentPage: pageNumber,
                limit: limitNumber,
            },
        };
    }

    async approveVoucher(voucherId, adminId) {
        const result = await pool.query(
            `
                UPDATE Vouchers
                SET status = 'Approved', approved_at = NOW(), rejected_reason = NULL
                WHERE voucher_id = $1
                RETURNING *
            `,
            [voucherId]
        );
        if (result.rowCount === 0) throw new Error('Voucher not found');

        await logAction(adminId, 'APPROVE_VOUCHER', 'Vouchers', voucherId);
        return result.rows[0];
    }

    async rejectVoucher(voucherId, adminId, reason) {
        if (!reason || reason.trim() === '') throw new Error('Reject reason is required');

        const result = await pool.query(
            `
                UPDATE Vouchers
                SET status = 'Rejected', approved_at = NULL, rejected_reason = $1
                WHERE voucher_id = $2
                RETURNING *
            `,
            [reason, voucherId]
        );
        if (result.rowCount === 0) throw new Error('Voucher not found');

        await logAction(adminId, 'REJECT_VOUCHER', 'Vouchers', voucherId);
        return result.rows[0];
    }

    async toggleVisibility(voucherId, currentStatus, adminId = null) {
        const nextStatus = currentStatus === 'Suspended' ? 'Approved' : 'Suspended';
        const result = await pool.query(
            'UPDATE Vouchers SET status = $1 WHERE voucher_id = $2 RETURNING *',
            [nextStatus, voucherId]
        );
        if (result.rowCount === 0) throw new Error('Voucher not found');

        await logAction(adminId, `TOGGLE_VOUCHER_VISIBILITY:${nextStatus}`, 'Vouchers', voucherId);
        return result.rows[0];
    }
}

module.exports = new AdminVoucherService();
