const pool = require('../../config/db');

class ComplaintService {
    async assertOrderBelongsToCustomer(orderId, customerId) {
        const { rows } = await pool.query(
            'SELECT 1 FROM Orders WHERE order_id = $1 AND customer_id = $2',
            [orderId, customerId]
        );
        if (rows.length === 0) {
            throw new Error('Order not found.');
        }
    }

    async createComplaint(customerId, data) {
        const client = await pool.connect();
        try {
            const { title, content, priority = 'Normal', voucherIds = [], orderId } = data;

            if (!content || !content.trim()) {
                throw new Error('Complaint content is required.');
            }
            if (orderId) {
                await this.assertOrderBelongsToCustomer(orderId, customerId);
            }

            await client.query('BEGIN');
            const complaintRes = await client.query(
                `
                    INSERT INTO Complaints (customer_id, title, content, status, priority)
                    VALUES ($1, $2, $3, 'Pending', $4)
                    RETURNING *
                `,
                [customerId, title || null, content, priority]
            );

            const complaint = complaintRes.rows[0];
            for (const voucherId of voucherIds || []) {
                await client.query(
                    `
                        INSERT INTO Complaint_Vouchers (complaint_id, voucher_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `,
                    [complaint.complaint_id, voucherId]
                );
            }

            await client.query('COMMIT');
            return complaint;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getMyComplaints(customerId) {
        const { rows } = await pool.query(
            `
                SELECT c.*,
                    COALESCE(json_agg(
                        DISTINCT jsonb_build_object('voucher_id', v.voucher_id, 'title', v.title)
                    ) FILTER (WHERE v.voucher_id IS NOT NULL), '[]') AS vouchers,
                    COUNT(cr.response_id)::int AS response_count
                FROM Complaints c
                LEFT JOIN Complaint_Vouchers cv ON c.complaint_id = cv.complaint_id
                LEFT JOIN Vouchers v ON cv.voucher_id = v.voucher_id
                LEFT JOIN Complaint_Responses cr ON c.complaint_id = cr.complaint_id
                WHERE c.customer_id = $1
                GROUP BY c.complaint_id
                ORDER BY c.created_at DESC, c.complaint_id DESC
            `,
            [customerId]
        );
        return rows;
    }

    async getComplaintDetail(complaintId, customerId) {
        const complaintRes = await pool.query(
            'SELECT * FROM Complaints WHERE complaint_id = $1 AND customer_id = $2',
            [complaintId, customerId]
        );
        if (complaintRes.rows.length === 0) {
            const error = new Error('Complaint not found.');
            error.statusCode = 404;
            throw error;
        }

        const vouchersRes = await pool.query(
            `
                SELECT v.voucher_id, v.title, v.image_url
                FROM Complaint_Vouchers cv
                JOIN Vouchers v ON cv.voucher_id = v.voucher_id
                WHERE cv.complaint_id = $1
                ORDER BY v.voucher_id
            `,
            [complaintId]
        );

        const responsesRes = await pool.query(
            `
                SELECT cr.response_id, cr.content, cr.created_at, u.username AS responder_name, u.role AS responder_role
                FROM Complaint_Responses cr
                LEFT JOIN Users u ON cr.responder_id = u.user_id
                WHERE cr.complaint_id = $1
                ORDER BY cr.created_at ASC, cr.response_id ASC
            `,
            [complaintId]
        );

        return {
            ...complaintRes.rows[0],
            vouchers: vouchersRes.rows,
            responses: responsesRes.rows,
        };
    }
}

module.exports = new ComplaintService();
