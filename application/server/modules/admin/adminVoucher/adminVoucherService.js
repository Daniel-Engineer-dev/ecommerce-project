    const pool = require('../../../config/db');

class AdminVoucherService {
    // Lấy danh sách voucher kèm theo thông tin của đối tác phát hành
    async getAdminVouchers({ status, search, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const values = [];
        let idx = 1;

        // --- CÂU LỆNH TÍNH TỔNG SỐ DÒNG (Để phục vụ phân trang ở Frontend) ---
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Users u ON p.user_id = u.user_id
            WHERE 1=1
        `;

        // --- CÂU LỆNH LẤY DỮ LIỆU CHI TIẾT ---
        let dataQuery = `
            SELECT v.*, p.company_name, u.email as partner_email
            FROM Vouchers v
            JOIN Partners p ON v.partner_id = p.user_id
            JOIN Users u ON p.user_id = u.user_id
            WHERE 1=1
        `;

        let filterQuery = '';

        // 1. Lọc theo trạng thái (Pending, Approved, Rejected, Suspended)
        if (status) {
            filterQuery += ` AND v.status = $${idx++}`;
            values.push(status);
        }

        // 2. Tìm kiếm đa thuộc tính (Tên voucher, Tên đối tác, Mã ID)
        if (search && search.trim() !== '') {
            filterQuery += ` AND (
                v.title                 ILIKE $${idx} OR 
                p.company_name          ILIKE $${idx} OR 
                v.voucher_id::TEXT      ILIKE $${idx}
            )`;
            values.push(`%${search.trim()}%`);
            idx++;
        }

        // Ghép phần lọc vào cả 2 câu truy vấn
        countQuery += filterQuery;
        dataQuery += filterQuery;

        // Thêm Sắp xếp và Phân trang (LIMIT / OFFSET) vào truy vấn lấy dữ liệu
        dataQuery += ` ORDER BY v.start_date DESC LIMIT $${idx++} OFFSET $${idx++}`;
        
        // Thực hiện truy vấn song song để tối ưu tốc độ
        const countValues = [...values];
        const dataValues = [...values, limit, offset];

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, countValues),
            pool.query(dataQuery, dataValues)
        ]);

        const totalItems = parseInt(countResult.rows[0].total, 10);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            vouchers: dataResult.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: parseInt(page, 10),
                limit: parseInt(limit, 10)
            }
        };
    }

    // Phê duyệt voucher (Kích hoạt hiển thị lên sàn)
    async approveVoucher(voucherId, adminId) {
        // Áp dụng quy tắc RB-12: Ghi nhận vết kiểm toán
        const query = `
            UPDATE Vouchers 
            SET status = 'Approved', approved_at = NOW(), rejected_reason = NULL
            WHERE voucher_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [adminId, voucherId]);
        if (result.rowCount === 0) throw new Error("Không tìm thấy voucher yêu cầu");
        
        // Mở rộng thêm: Ở đây bạn có thể gọi hàm ghi vào bảng SystemLogs (RB-12)
        return result.rows[0];
    }

    // Từ chối voucher kèm lý do chi tiết
    async rejectVoucher(voucherId, adminId, reason) {
        if (!reason || reason.trim() === '') throw new Error("Lý do từ chối không được để trống");
        
        const query = `
            UPDATE Vouchers 
            SET status = 'Rejected', approved_at = NOW(), rejected_reason = $2
            WHERE voucher_id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [adminId, reason, voucherId]);
        if (result.rowCount === 0) throw new Error("Không tìm thấy voucher yêu cầu");
        return result.rows[0];
    }

    // Thay đổi trạng thái hiển thị khẩn cấp (Toggle Lock/Suspend)
    async toggleVisibility(voucherId, currentStatus) {
        const nextStatus = currentStatus === 'Suspended' ? 'Approved' : 'Suspended';
        const query = `
            UPDATE Vouchers SET status = $1 WHERE voucher_id = $2 RETURNING *
        `;
        const result = await pool.query(query, [nextStatus, voucherId]);
        if (result.rowCount === 0) throw new Error("Không tìm thấy voucher yêu cầu");
        return result.rows[0];
    }
}

module.exports = new AdminVoucherService();
