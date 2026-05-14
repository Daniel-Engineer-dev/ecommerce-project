const pool = require('../../config/db');

class VoucherService {
    async getVouchers() {
        const query = `
            SELECT v.*, p.company_name, c.category_name 
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.status = 'Approved'
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
        const result = await pool.query("SELECT user_id, company_name FROM Partners WHERE status = 'Approved' ORDER BY company_name ASC");
        return result.rows;
    }

    async getVoucherById(id) {
        // Lấy thông tin voucher, đối tác và danh mục
        const voucherQuery = `
            SELECT v.*, p.company_name, p.representative_name, c.category_name 
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.voucher_id = $1
        `;
        const voucherResult = await pool.query(voucherQuery, [id]);
        
        if (voucherResult.rows.length === 0) return null;

        const voucher = voucherResult.rows[0];

        // Lấy danh sách chi nhánh
        const branchesResult = await pool.query('SELECT * FROM Branches WHERE partner_id = $1', [voucher.partner_id]);

        // Lấy danh sách đánh giá
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
        
        // Tính điểm trung bình
        if (voucher.reviews.length > 0) {
            const sum = voucher.reviews.reduce((acc, rev) => acc + rev.rating, 0);
            voucher.average_rating = (sum / voucher.reviews.length).toFixed(1);
        } else {
            voucher.average_rating = 0;
        }

        return voucher;
    }

    async searchVouchers(filters) {
        const { q, category, minPrice, maxPrice, minDiscount, area, partner } = filters;
        
        let query = `
            SELECT DISTINCT v.*, p.company_name, c.category_name 
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            LEFT JOIN Branches b ON v.partner_id = b.partner_id
            WHERE v.status = 'Approved' AND v.expiry_date > NOW()
        `;
        
        const values = [];
        let count = 1;

        if (q) {
            query += ` AND (v.title ILIKE $${count} OR v.description ILIKE $${count})`;
            values.push(`%${q}%`);
            count++;
        }
        if (category) {
            query += ` AND v.category_id = $${count}`;
            values.push(category);
            count++;
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

        query += ` ORDER BY v.voucher_id DESC`;
        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = new VoucherService();
