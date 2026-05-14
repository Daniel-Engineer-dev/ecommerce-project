const pool = require('../config/db');

const getVouchers = async (req, res) => {
    try {
        const query = `
            SELECT v.*, p.company_name, c.category_name 
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.status = 'Approved'
            ORDER BY v.voucher_id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Categories ORDER BY category_name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPartnersList = async (req, res) => {
    try {
        const result = await pool.query("SELECT user_id, company_name FROM Partners WHERE status = 'Approved' ORDER BY company_name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVoucherById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin voucher, đối tác và danh mục
        const voucherQuery = `
            SELECT v.*, p.company_name, p.representative_name, c.category_name 
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Categories c ON v.category_id = c.category_id
            WHERE v.voucher_id = $1
        `;
        const voucherResult = await pool.query(voucherQuery, [id]);
        
        if (voucherResult.rows.length === 0) {
            return res.status(404).json({ message: "Voucher không tồn tại" });
        }

        const voucher = voucherResult.rows[0];

        // Lấy danh sách chi nhánh của đối tác này
        const branchesResult = await pool.query(
            'SELECT * FROM Branches WHERE partner_id = $1', 
            [voucher.partner_id]
        );

        // Lấy danh sách đánh giá kèm tên khách hàng
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

        res.json(voucher);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi lấy chi tiết voucher" });
    }
};

const searchVouchers = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, minDiscount, area, partner } = req.query;
        
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

        // Tìm kiếm theo từ khóa (Tiêu đề hoặc Mô tả)
        if (q) {
            query += ` AND (v.title ILIKE $${count} OR v.description ILIKE $${count})`;
            values.push(`%${q}%`);
            count++;
        }

        // Lọc theo danh mục
        if (category) {
            query += ` AND v.category_id = $${count}`;
            values.push(category);
            count++;
        }

        // Lọc theo khoảng giá
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

        // Lọc theo mức giảm giá (%)
        if (minDiscount) {
            query += ` AND v.discount_percent >= $${count}`;
            values.push(minDiscount);
            count++;
        }

        // Lọc theo đối tác
        if (partner) {
            query += ` AND v.partner_id = $${count}`;
            values.push(partner);
            count++;
        }

        // Lọc theo khu vực (Địa chỉ chi nhánh)
        if (area) {
            query += ` AND b.address ILIKE $${count}`;
            values.push(`%${area}%`);
            count++;
        }

        query += ` ORDER BY v.voucher_id DESC`;

        const result = await pool.query(query, values);
        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi tìm kiếm voucher" });
    }
};

module.exports = { getVouchers, getVoucherById, searchVouchers, getCategories, getPartnersList };
