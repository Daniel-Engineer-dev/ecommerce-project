const pool = require('../../config/db');

const ACTIVE_COMPLAINT_STATUSES = ['Pending', 'Processing'];
const MAX_COMPLAINTS_PER_ORDER = Number(process.env.MAX_COMPLAINTS_PER_ORDER || 2);
const COMPLAINABLE_ORDER_STATUSES = ['Paid', 'Refunded'];

class ComplaintService {
    async assertOrderBelongsToCustomer(orderId, customerId, client = pool, lock = false) {
        const { rows } = await client.query(
            `SELECT order_id, status FROM Orders WHERE order_id = $1 AND customer_id = $2${lock ? ' FOR UPDATE' : ''}`,
            [orderId, customerId]
        );
        if (rows.length === 0) {
            throw new Error('Order not found.');
        }
        return rows[0];
    }

    async assertOrderCanReceiveComplaint(orderId, customerId, client = pool) {
        const order = await this.assertOrderBelongsToCustomer(orderId, customerId, client, true);
        if (!COMPLAINABLE_ORDER_STATUSES.includes(order.status)) {
            throw new Error('Only paid or refunded orders can be complained.');
        }

        const { rows } = await client.query(
            `
                SELECT
                    COUNT(*)::int AS total_count,
                    COUNT(*) FILTER (WHERE status = ANY($3::varchar[]))::int AS active_count
                FROM Complaints
                WHERE order_id = $1 AND customer_id = $2
            `,
            [orderId, customerId, ACTIVE_COMPLAINT_STATUSES]
        );

        const totalCount = Number(rows[0]?.total_count || 0);
        const activeCount = Number(rows[0]?.active_count || 0);

        if (activeCount > 0) {
            throw new Error('This order already has a complaint being processed.');
        }
        if (totalCount >= MAX_COMPLAINTS_PER_ORDER) {
            throw new Error('This order has exceeded the allowed number of complaints.');
        }

        return { order, attemptNo: totalCount + 1 };
    }

    async assertVouchersBelongToOrder(voucherIds, customerId, orderId, client = pool) {
        const normalizedIds = [...new Set((voucherIds || [])
            .map((id) => Number.parseInt(id, 10))
            .filter((id) => Number.isInteger(id) && id > 0))];

        if (normalizedIds.length === 0) return [];
        if (!orderId) throw new Error('An order is required when selecting complaint vouchers.');

        const { rows } = await client.query(
            `
                SELECT DISTINCT oi.voucher_id
                FROM Orders o
                JOIN Order_Items oi ON o.order_id = oi.order_id
                WHERE o.customer_id = $1
                    AND o.order_id = $2
                    AND o.status = ANY($3::varchar[])
                    AND oi.voucher_id = ANY($4::int[])
            `,
            [customerId, orderId, COMPLAINABLE_ORDER_STATUSES, normalizedIds]
        );
        const ownedIds = new Set(rows.map((row) => Number(row.voucher_id)));
        const invalidIds = normalizedIds.filter((id) => !ownedIds.has(id));
        if (invalidIds.length > 0) {
            throw new Error('Some selected vouchers are not eligible for complaint.');
        }

        return normalizedIds;
    }

    async createComplaint(customerId, data) {
        const client = await pool.connect();
        try {
            const { title, content, priority = 'Normal', voucherIds = [], orderId } = data;

            if (!content || !content.trim()) {
                throw new Error('Complaint content is required.');
            }
            await client.query('BEGIN');

            let attemptNo = 1;
            if (orderId) {
                const complaintGuard = await this.assertOrderCanReceiveComplaint(orderId, customerId, client);
                attemptNo = complaintGuard.attemptNo;
            }
            const normalizedVoucherIds = await this.assertVouchersBelongToOrder(voucherIds, customerId, orderId, client);

            const complaintRes = await client.query(
                `
                    INSERT INTO Complaints (customer_id, order_id, title, content, status, priority, attempt_no, updated_at)
                    VALUES ($1, $2, $3, $4, 'Pending', $5, $6, NOW())
                    RETURNING *
                `,
                [customerId, orderId || null, title || null, content, priority, attemptNo]
            );

            const complaint = complaintRes.rows[0];
            for (const voucherId of normalizedVoucherIds) {
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
                    o.total_amount AS order_total_amount,
                    o.status AS order_status,
                    o.payment_method AS order_payment_method,
                    COALESCE(json_agg(
                        DISTINCT jsonb_build_object('voucher_id', v.voucher_id, 'title', v.title)
                    ) FILTER (WHERE v.voucher_id IS NOT NULL), '[]') AS vouchers,
                    COUNT(cr.response_id)::int AS response_count
                FROM Complaints c
                LEFT JOIN Orders o ON c.order_id = o.order_id
                LEFT JOIN Complaint_Vouchers cv ON c.complaint_id = cv.complaint_id
                LEFT JOIN Vouchers v ON cv.voucher_id = v.voucher_id
                LEFT JOIN Complaint_Responses cr ON c.complaint_id = cr.complaint_id
                WHERE c.customer_id = $1
                GROUP BY c.complaint_id, o.order_id
                ORDER BY c.created_at DESC, c.complaint_id DESC
            `,
            [customerId]
        );
        return rows;
    }

    async getComplaintDetail(complaintId, customerId) {
        const complaintRes = await pool.query(
            `
                SELECT c.*, o.total_amount AS order_total_amount,
                    o.status AS order_status, o.payment_method AS order_payment_method
                FROM Complaints c
                LEFT JOIN Orders o ON c.order_id = o.order_id
                WHERE c.complaint_id = $1 AND c.customer_id = $2
            `,
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

    async getOrderComplaints(orderId, customerId) {
        await this.assertOrderBelongsToCustomer(orderId, customerId);
        const { rows } = await pool.query(
            `
                SELECT *
                FROM Complaints
                WHERE order_id = $1 AND customer_id = $2
                ORDER BY created_at DESC, complaint_id DESC
            `,
            [orderId, customerId]
        );
        return rows;
    }
}

module.exports = new ComplaintService();
