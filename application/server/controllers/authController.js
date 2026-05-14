const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');

const register = async (req, res) => {
    console.log(">>> Dữ liệu đăng ký nhận được:", req.body);
    const client = await pool.connect();
    try {
        const { username, password, full_name, company_name, representative_name, email, role, dob, address, tax_id, headquarters, phone, branches } = req.body;

        // 1. Kiểm tra username tồn tại
        const userExists = await client.query('SELECT user_id FROM Users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            console.warn(`[Register] Username '${username}' đã tồn tại trong DB.`);
            return res.status(400).json({ message: `Tên đăng nhập "${username}" đã tồn tại trên hệ thống.` });
        }

        // 2. Kiểm tra email tồn tại (nếu có nhập)
        if (email) {
            const emailExists = await client.query('SELECT * FROM Users WHERE email = $1', [email]);
            if (emailExists.rows.length > 0) {
                return res.status(400).json({ message: "Email này đã được sử dụng" });
            }
        }

        // 3. Kiểm tra phone tồn tại (nếu có nhập)
        if (phone) {
            const phoneExists = await client.query('SELECT * FROM Users WHERE phone = $1', [phone]);
            if (phoneExists.rows.length > 0) {
                return res.status(400).json({ message: "Số điện thoại này đã được sử dụng" });
            }
        }

        // 4. Yêu cầu ít nhất email hoặc phone
        if (!email && !phone) {
            return res.status(400).json({ message: "Vui lòng cung cấp Email hoặc Số điện thoại" });
        }

        // 5. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await client.query('BEGIN');

        // 6. Thêm vào bảng Users
        const newUser = await client.query(
            'INSERT INTO Users (username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, role',
            [username, hashedPassword, email || null, phone || null, role || 'Customer']
        );

        const userId = newUser.rows[0].user_id;

        // 7. Thêm thông tin chi tiết
        if (role === 'Partner') {
            const dbTaxId = tax_id && tax_id.trim() !== '' ? tax_id : null;
            const dbHq = headquarters && headquarters.trim() !== '' ? headquarters : null;
            const dbRepName = representative_name && representative_name.trim() !== '' ? representative_name : null;

            await client.query(
                'INSERT INTO Partners (user_id, company_name, representative_name, tax_id, headquarters) VALUES ($1, $2, $3, $4, $5)',
                [userId, company_name, dbRepName, dbTaxId, dbHq]
            );

            // 8. Thêm chi nhánh (nếu có)
            if (branches && branches.length > 0) {
                for (const branch of branches) {
                    if (branch.branch_name.trim() !== '') {
                        await client.query(
                            'INSERT INTO Branches (partner_id, branch_name, address, phone) VALUES ($1, $2, $3, $4)',
                            [userId, branch.branch_name, branch.address, branch.phone]
                        );
                    }
                }
            }

        } else {
            const dbDob = dob && dob.trim() !== '' ? dob : null;
            const dbAddress = address && address.trim() !== '' ? address : null;

            await client.query(
                'INSERT INTO Customers (user_id, full_name, dob, address) VALUES ($1, $2, $3, $4)',
                [userId, full_name, dbDob, dbAddress]
            );
        }


        await client.query('COMMIT');
        res.status(201).json({ message: "Đăng ký thành công", user: newUser.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi đăng ký:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi đăng ký" });
    } finally {
        client.release();
    }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Kiểm tra User
        const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        const user = result.rows[0];

        // 2. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        // 3. Nếu là Đối tác, kiểm tra trạng thái xét duyệt
        if (user.role === 'Partner') {
            const partnerResult = await pool.query('SELECT status FROM Partners WHERE user_id = $1', [user.user_id]);
            const partnerStatus = partnerResult.rows[0]?.status;

            if (partnerStatus === 'Pending') {
                return res.status(403).json({ message: "Tài khoản của bạn đang chờ xét duyệt" });
            } else if (partnerStatus === 'Rejected') {
                return res.status(403).json({ message: "Tài khoản đối tác đã bị từ chối xét duyệt. Vui lòng liên hệ quản trị viên." });
            }
        }

        // 4. Tạo JWT Token
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'secretkey_tmdt',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi đăng nhập" });
    }
};

const getProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id, role } = req.user;
        let query = '';

        if (role === 'Partner') {
            query = `
                SELECT u.username, u.email, u.phone, u.role, p.company_name, p.representative_name, p.tax_id, p.headquarters, p.status 
                FROM Users u 
                JOIN Partners p ON u.user_id = p.user_id 
                WHERE u.user_id = $1
            `;
            const profileRes = await client.query(query, [id]);

            // Lấy thêm chi nhánh
            const branchesRes = await client.query('SELECT * FROM Branches WHERE partner_id = $1', [id]);

            return res.json({
                ...profileRes.rows[0],
                branches: branchesRes.rows
            });

        } else {
            query = `
                SELECT u.username, u.email, u.phone, u.role, c.full_name, c.dob, c.address 
                FROM Users u 
                JOIN Customers c ON u.user_id = c.user_id 
                WHERE u.user_id = $1
            `;
            const result = await client.query(query, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi lấy thông tin hồ sơ" });
    } finally {
        client.release();
    }
};



const updateProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id, role } = req.user;
        const { email, phone, full_name, dob, address, company_name, representative_name, tax_id, headquarters } = req.body;

        await client.query('BEGIN');

        // 1. Cập nhật email và phone trong Users
        await client.query('UPDATE Users SET email = $1, phone = $2 WHERE user_id = $3', [email || null, phone || null, id]);

        // 2. Cập nhật bảng chi tiết
        if (role === 'Partner') {
            const { branches } = req.body;
            await client.query(
                'UPDATE Partners SET company_name = $1, representative_name = $2, tax_id = $3, headquarters = $4 WHERE user_id = $5',
                [company_name, representative_name, tax_id, headquarters, id]
            );

            // 3. Cập nhật chi nhánh (Xóa cũ, thêm mới)
            if (branches) {
                await client.query('DELETE FROM Branches WHERE partner_id = $1', [id]);
                for (const branch of branches) {
                    if (branch.branch_name && branch.branch_name.trim() !== '') {
                        await client.query(
                            'INSERT INTO Branches (partner_id, branch_name, address, phone) VALUES ($1, $2, $3, $4)',
                            [id, branch.branch_name, branch.address, branch.phone]
                        );
                    }
                }
            }

        } else {

            await client.query(
                'UPDATE Customers SET full_name = $1, dob = $2, address = $3 WHERE user_id = $4',
                [full_name, dob, address, id]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Cập nhật hồ sơ thành công" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi cập nhật hồ sơ" });
    } finally {
        client.release();
    }
};


const changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { oldPassword, newPassword } = req.body;

        // 1. Lấy mật khẩu cũ
        const result = await pool.query('SELECT password FROM Users WHERE user_id = $1', [id]);
        const user = result.rows[0];

        // 2. Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Cập nhật
        await pool.query('UPDATE Users SET password = $1 WHERE user_id = $2', [hashedPassword, id]);

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi đổi mật khẩu" });
    }
};

const checkAvailability = async (req, res) => {
    try {
        const { username, email, phone } = req.body;

        if (username) {
            const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
            if (result.rows.length > 0) return res.status(400).json({ message: "Tên đăng nhập này đã tồn tại" });
        }

        if (email) {
            const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
            if (result.rows.length > 0) return res.status(400).json({ message: "Email này đã được sử dụng" });
        }

        if (phone) {
            const result = await pool.query('SELECT * FROM Users WHERE phone = $1', [phone]);
            if (result.rows.length > 0) return res.status(400).json({ message: "Số điện thoại này đã được sử dụng" });
        }

        res.json({ available: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi kiểm tra tính khả dụng" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (email) {
            const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
            const user = result.rows[0];
            if (!user) return res.status(404).json({ message: "Email này chưa được đăng ký" });

            // 1. Tạo Reset Token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // 2. Hash Token để lưu vào DB (bảo mật)
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiry = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

            // 3. Lưu vào DB
            await pool.query(
                'UPDATE Users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
                [tokenHash, expiry, user.user_id]
            );

            // 4. Tạo URL gửi mail
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            // 5. Nội dung Email
            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #2563eb;">Khôi phục mật khẩu Dealzy</h2>
                    <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản Dealzy của mình.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để hoàn tất quá trình. Link này có hiệu lực trong 15 phút:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 700;">Đặt lại mật khẩu</a>
                    </div>
                    <p style="color: #64748b; font-size: 0.85rem;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: 'Dealzy - Khôi phục mật khẩu',
                html
            });

            return res.json({ message: "Link khôi phục mật khẩu đã được gửi đến Email của bạn" });
        } else if (phone) {
            const result = await pool.query('SELECT * FROM Users WHERE phone = $1', [phone]);
            const user = result.rows[0];
            if (!user) return res.status(404).json({ message: "Số điện thoại này chưa được đăng ký" });

            // 1. Tạo OTP 6 chữ số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // 2. Hash OTP để lưu vào DB (dùng chung reset_token)
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
            const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP có hiệu lực 5 phút

            // 3. Lưu vào DB
            await pool.query(
                'UPDATE Users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
                [otpHash, expiry, user.user_id]
            );

            // 4. Gửi SMS
            const smsSent = await sendSms({
                phone: user.phone,
                content: `Ma OTP khoi phuc mat khau Dealzy cua ban la: ${otp}. Hieu luc trong 5 phut.`
            });

            if (!smsSent) return res.status(500).json({ message: "Không thể gửi SMS lúc này. Vui lòng thử lại sau." });

            return res.json({ message: "Mã OTP đã được gửi đến SĐT của bạn" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi khôi phục mật khẩu" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // 1. Hash token nhận được để so khớp với DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Tìm User có token hợp lệ và chưa hết hạn
        const result = await pool.query(
            'SELECT * FROM Users WHERE reset_token = $1 AND reset_token_expiry > $2',
            [tokenHash, new Date()]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Cập nhật mật khẩu và xóa token
        await pool.query(
            'UPDATE Users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2',
            [hashedPassword, user.user_id]
        );

        res.json({ message: "Mật khẩu của bạn đã được thay đổi thành công" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi đặt lại mật khẩu" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // 1. Tìm User theo số điện thoại
        const result = await pool.query('SELECT * FROM Users WHERE phone = $1', [phone]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        // 2. Hash OTP nhận được để so khớp
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        // 3. Kiểm tra OTP và thời gian hết hạn
        if (user.reset_token !== otpHash || new Date(user.reset_token_expiry) < new Date()) {
            return res.status(400).json({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
        }

        // 4. Trả về token tạm thời để cho phép đổi mật khẩu ở bước sau
        // Hoặc đơn giản là trả về success để Frontend cho hiển thị form đổi mật khẩu
        res.json({
            message: "Xác thực OTP thành công",
            tempToken: otp // Ở đây dùng chính OTP làm token reset trong bước tiếp theo
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi xác thực OTP" });
    }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, checkAvailability, forgotPassword, resetPassword, verifyOtp };
