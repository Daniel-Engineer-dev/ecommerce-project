const pool = require('../../config/db');

class VoucherService {
    async getVouchers() {
        const query = `
            SELECT v.*, p.company_name, c.category_name
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.status = 'Approved'
                AND v.start_date <= NOW()
                AND v.expiry_date > NOW()
                AND v.quantity_stock > 0
            ORDER BY v.voucher_id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async getCategories() {
        const result = await pool.query('SELECT * FROM Categories ORDER BY category_name ASC');
        return result.rows;
    }

    async getPartnersList() {
        const result = await pool.query("SELECT user_id, company_name FROM Partners WHERE COALESCE(status, 'Approved') = 'Approved' ORDER BY company_name ASC");
        return result.rows;
    }

    async getVoucherById(id) {
        const voucherQuery = `
            SELECT v.*, p.company_name, p.representative_name, c.category_name
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.voucher_id = $1
                AND v.status = 'Approved'
                AND v.start_date <= NOW()
                AND v.expiry_date > NOW()
                AND v.quantity_stock > 0
        `;
        const voucherResult = await pool.query(voucherQuery, [id]);

        if (voucherResult.rows.length === 0) return null;

        const voucher = voucherResult.rows[0];

        let branchesResult;
        try {
            branchesResult = await pool.query(`
                SELECT b.*
                FROM Voucher_Branches vb
                JOIN Branches b ON b.branch_id = vb.branch_id
                WHERE vb.voucher_id = $1
                ORDER BY b.branch_id
            `, [id]);
        } catch (err) {
            if (err.code !== '42P01') throw err;
            branchesResult = await pool.query(
                'SELECT * FROM Branches WHERE partner_id = $1 ORDER BY branch_id',
                [voucher.partner_id]
            );
        }

        const reviewsQuery = `
            SELECT r.*, c.full_name
            FROM Reviews r
            JOIN Customers c ON r.customer_id = c.user_id
            WHERE r.voucher_id = $1
            ORDER BY r.created_at DESC
        `;
        const reviewsResult = await pool.query(reviewsQuery, [id]);

        voucher.branches = branchesResult.rows;
        voucher.reviews = reviewsResult.rows;

        if (voucher.reviews.length > 0) {
            const sum = voucher.reviews.reduce((acc, rev) => acc + rev.rating, 0);
            voucher.average_rating = (sum / voucher.reviews.length).toFixed(1);
        } else {
            voucher.average_rating = 0;
        }

        return voucher;
    }

    async searchVouchers(filters) {
        const { q, category, minPrice, maxPrice, minDiscount, area, partner, sort, limit, offset } = filters;
        const parsedLimit = Number.parseInt(limit, 10);
        const resultLimit = Number.isInteger(parsedLimit)
            ? Math.min(Math.max(parsedLimit, 1), 48)
            : null;
        const parsedOffset = Number.parseInt(offset, 10);
        const resultOffset = Number.isInteger(parsedOffset)
            ? Math.max(parsedOffset, 0)
            : null;

        let query = `
            SELECT DISTINCT v.*, p.company_name, c.category_name,
                COALESCE(sold_stats.sold_count, 0) AS sold_count,
                GREATEST(v.total_quantity - v.quantity_stock, 0) AS issued_count
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            LEFT JOIN Branches b ON v.partner_id = b.partner_id
            LEFT JOIN (
                SELECT oi.voucher_id, SUM(oi.quantity) AS sold_count
                FROM Order_Items oi
                JOIN Orders o ON oi.order_id = o.order_id
                WHERE o.status = 'Paid'
                GROUP BY oi.voucher_id
            ) sold_stats ON sold_stats.voucher_id = v.voucher_id
            WHERE v.status = 'Approved'
                AND v.start_date <= NOW()
                AND v.expiry_date > NOW()
                AND v.quantity_stock > 0
        `;

        const values = [];
        let count = 1;

        if (q) {
            query += ` AND (v.title ILIKE $${count} OR v.description ILIKE $${count})`;
            values.push(`%${q}%`);
            count++;
        }

        const categoryParam = category || filters.categoryIds;
        if (categoryParam) {
            const categoryIds = String(categoryParam)
                .split(',')
                .map((id) => Number.parseInt(id, 10))
                .filter((id) => Number.isInteger(id) && id > 0);

            if (categoryIds.length > 0) {
                query += ` AND v.category_id = ANY($${count}::int[])`;
                values.push(categoryIds);
                count++;
            }
        }

        if (minPrice) {
            query += ` AND v.sale_price >= $${count}`;
            values.push(minPrice);
            count++;
        }
        if (maxPrice) {
            query += ` AND v.sale_price <= $${count}`;
            values.push(maxPrice);
            count++;
        }
        if (minDiscount) {
            query += ` AND v.discount_percent >= $${count}`;
            values.push(minDiscount);
            count++;
        }
        if (partner) {
            query += ` AND v.partner_id = $${count}`;
            values.push(partner);
            count++;
        }
        if (area) {
            query += ` AND b.address ILIKE $${count}`;
            values.push(`%${area}%`);
            count++;
        }
        if (sort === 'best-selling' || sort === 'best') {
            query += `
                ORDER BY
                    sold_count DESC,
                    issued_count DESC,
                    v.discount_percent DESC,
                    v.voucher_id DESC
            `;
        } else if (sort === 'new') {
            query += ` ORDER BY v.start_date DESC, v.voucher_id DESC`;
        } else {
            query += ` ORDER BY v.voucher_id DESC`;
        }
        if (resultLimit) {
            query += ` LIMIT $${count}`;
            values.push(resultLimit);
            count++;
        }
        if (resultOffset) {
            query += ` OFFSET $${count}`;
            values.push(resultOffset);
        }
        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = new VoucherService();
