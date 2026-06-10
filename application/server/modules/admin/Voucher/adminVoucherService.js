const pool = require('../../../config/db');
const { logAction } = require('../../../utils/systemLog');
const eventBus = require('../../../utils/eventBus');

class AdminVoucherService {
    async getVoucherReviewColumns() {
        const result = await pool.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'vouchers'
              AND column_name IN ('approved_at', 'rejected_reason')
            `
        );
        return new Set(result.rows.map((row) => row.column_name));
    }

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
                v.title ILIKE $${idx} OR
                p.company_name ILIKE $${idx} OR
                v.voucher_id::TEXT ILIKE $${idx} OR
                u.email ILIKE $${idx}
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
        const columns = await this.getVoucherReviewColumns();
        const setClauses = ["status = 'Approved'"];
        if (columns.has('approved_at')) setClauses.push('approved_at = NOW()');
        if (columns.has('rejected_reason')) setClauses.push('rejected_reason = NULL');

        const result = await pool.query(
            `
                UPDATE Vouchers
                SET ${setClauses.join(', ')}
                WHERE voucher_id = $1 AND status = 'Pending'
                RETURNING *
            `,
            [voucherId]
        );
        if (result.rowCount === 0) throw new Error('Only pending vouchers can be approved');

        await logAction(adminId, 'APPROVE_VOUCHER', 'Vouchers', voucherId);
        eventBus.emit('voucher.status_changed', {
            voucherId: result.rows[0].voucher_id,
            partnerId: result.rows[0].partner_id,
            status: result.rows[0].status,
            source: 'admin',
        });
        return result.rows[0];
    }

    async rejectVoucher(voucherId, adminId, reason) {
        if (!reason || reason.trim() === '') throw new Error('Reject reason is required');

        const columns = await this.getVoucherReviewColumns();
        const setClauses = ["status = 'Rejected'"];
        const values = [voucherId];

        if (columns.has('approved_at')) setClauses.push('approved_at = NULL');
        if (columns.has('rejected_reason')) {
            values.unshift(reason.trim());
            setClauses.push('rejected_reason = $1');
        }

        const voucherIdParam = columns.has('rejected_reason') ? '$2' : '$1';
        const result = await pool.query(
            `
                UPDATE Vouchers
                SET ${setClauses.join(', ')}
                WHERE voucher_id = ${voucherIdParam} AND status = 'Pending'
                RETURNING *
            `,
            values
        );
        if (result.rowCount === 0) throw new Error('Only pending vouchers can be rejected');

        await logAction(adminId, 'REJECT_VOUCHER', 'Vouchers', voucherId);
        eventBus.emit('voucher.status_changed', {
            voucherId: result.rows[0].voucher_id,
            partnerId: result.rows[0].partner_id,
            status: result.rows[0].status,
            source: 'admin',
        });
        return result.rows[0];
    }

    async toggleVisibility(voucherId, _currentStatus, adminId = null) {
        const result = await pool.query(
            `
                UPDATE Vouchers
                SET status = CASE WHEN status = 'Approved' THEN 'Suspended' ELSE 'Approved' END
                WHERE voucher_id = $1 AND status IN ('Approved', 'Suspended')
                RETURNING *
            `,
            [voucherId]
        );
        if (result.rowCount === 0) throw new Error('Only approved or suspended vouchers can change visibility');
        const nextStatus = result.rows[0].status;

        await logAction(adminId, `TOGGLE_VOUCHER_VISIBILITY:${nextStatus}`, 'Vouchers', voucherId);
        eventBus.emit('voucher.status_changed', {
            voucherId: result.rows[0].voucher_id,
            partnerId: result.rows[0].partner_id,
            status: result.rows[0].status,
            source: 'admin',
        });
        return result.rows[0];
    }

    async getPartnerVoucherCount(partnerId) {
        const result = await pool.query(
            `SELECT COUNT(*) as total FROM Vouchers WHERE partner_id = $1`,
            [partnerId]
        );
        return parseInt(result.rows[0].total, 10);
    }
}

module.exports = new AdminVoucherService();
