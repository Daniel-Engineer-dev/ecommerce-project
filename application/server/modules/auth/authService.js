const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/sendEmail');
const sendSms = require('../../utils/sendSms');

const registrationOtps = new Map();
const PASSWORD_RESET_ROLES = new Set(['Customer', 'Partner']);

class AuthService {
    normalizePasswordResetRole(role) {
        if (!role) return null;
        const normalized = String(role).trim();
        if (!PASSWORD_RESET_ROLES.has(normalized)) {
            throw new Error('Vai tro khoi phuc mat khau khong hop le');
        }
        return normalized;
    }

    async findResetUser({ email, phone, role }) {
        const targetRole = this.normalizePasswordResetRole(role);
        const identifier = email || phone;
        if (!identifier) throw new Error('Email hoặc số điện thoại là bắt buộc');

        const filters = [];
        const values = [];
        let index = 1;

        if (email) {
            filters.push(`lower(email) = lower($${index++})`);
            values.push(email);
        } else {
            filters.push(`phone = $${index++}`);
            values.push(phone);
        }

        if (targetRole) {
            filters.push(`role = $${index++}`);
            values.push(targetRole);
        }

        const result = await pool.query(
            `SELECT * FROM Users WHERE ${filters.join(' AND ')} LIMIT 1`,
            values
        );

        const user = result.rows[0];
        if (!user) {
            const roleHint = targetRole === 'Customer' ? 'khach hang' : targetRole === 'Partner' ? 'doi tac' : '';
            throw new Error(email
                ? `Email khong ton tai${roleHint ? ` trong tai khoan ${roleHint}` : ''}`
                : `So dien thoai khong ton tai${roleHint ? ` trong tai khoan ${roleHint}` : ''}`);
        }
        return user;
    }

    createAccessToken(user) {
        return jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'secretkey_tmdt',
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
        );
    }

    createRefreshToken(user) {
        return jwt.sign(
            { id: user.user_id, role: user.role, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secretkey_tmdt',
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );
    }

    createPasswordResetToken(user) {
        return jwt.sign(
            { id: user.user_id, role: user.role, type: 'password_reset' },
            process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'secretkey_tmdt',
            { expiresIn: '10m' }
        );
    }

    async register(data) {
        const client = await pool.connect();
        try {
            const {
                username,
                password,
                full_name,
                company_name,
                representative_name,
                email,
                role,
                dob,
                address,
                tax_id,
                headquarters,
                phone,
                branches,
                otp,
            } = data;

            if (role === 'Customer') {
                const identifier = email || phone;
                if (!identifier) throw new Error('Email hoặc số điện thoại là bắt buộc');
                const stored = registrationOtps.get(identifier);
                if (!stored || stored.otp !== otp || stored.expiry < Date.now()) {
                    throw new Error('Mã xác thực OTP không chính xác hoặc đã hết hạn');
                }
                registrationOtps.delete(identifier);
            }

            const userExists = await client.query('SELECT user_id FROM Users WHERE username = $1', [username]);
            if (userExists.rows.length > 0) throw new Error(`Ten dang nhap "${username}" da ton tai.`);

            if (email) {
                const emailExists = await client.query('SELECT user_id FROM Users WHERE lower(email) = lower($1)', [email]);
                if (emailExists.rows.length > 0) throw new Error('Email nay da duoc su dung');
            }

            if (phone) {
                const phoneExists = await client.query('SELECT user_id FROM Users WHERE phone = $1', [phone]);
                if (phoneExists.rows.length > 0) throw new Error('So dien thoai nay da duoc su dung');
            }

            if (role === 'Partner') {
                const requiredPartnerFields = [
                    [company_name, 'Ten cong ty la bat buoc'],
                    [representative_name, 'Nguoi dai dien la bat buoc'],
                    [tax_id, 'Ma so thue la bat buoc'],
                    [headquarters, 'Tru so chinh la bat buoc'],
                ];

                for (const [value, message] of requiredPartnerFields) {
                    if (!value?.trim()) throw new Error(message);
                }

                const hasValidBranch = Array.isArray(branches)
                    && branches.some((branch) => branch.branch_name?.trim() && branch.address?.trim());
                if (!hasValidBranch) throw new Error('Can it nhat mot chi nhanh hop le');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await client.query('BEGIN');

            const newUser = await client.query(
                'INSERT INTO Users (username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, role',
                [username, hashedPassword, email || null, phone || null, role || 'Customer']
            );

            const userId = newUser.rows[0].user_id;

            if (role === 'Partner') {
                await client.query(
                    'INSERT INTO Partners (user_id, company_name, representative_name, tax_id, headquarters) VALUES ($1, $2, $3, $4, $5)',
                    [userId, company_name, representative_name, tax_id, headquarters]
                );

                if (branches && branches.length > 0) {
                    for (const branch of branches) {
                        if (branch.branch_name?.trim()) {
                            await client.query(
                                'INSERT INTO Branches (partner_id, branch_name, address, phone) VALUES ($1, $2, $3, $4)',
                                [userId, branch.branch_name, branch.address, branch.phone]
                            );
                        }
                    }
                }
            } else {
                await client.query(
                    'INSERT INTO Customers (user_id, full_name, dob, address) VALUES ($1, $2, $3, $4)',
                    [userId, full_name, dob, address]
                );
            }

            await client.query('COMMIT');
            return newUser.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async login(username, password) {
        const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (result.rows.length === 0) throw new Error('Tài khoản không tồn tại');

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Mật khẩu không chính xác');

        // ─── KIỂM TRA TRẠNG THÁI HOẠT ĐỘNG (IS_ACTIVE) THEO VAI TRÒ ───
        if (user.role === 'Partner') {
            const partnerRes = await pool.query(
                'SELECT status, is_active FROM Partners WHERE user_id = $1', 
                [user.user_id]
            );
            const partner = partnerRes.rows[0];
            
            if (!partner) throw new Error('Thông tin đối tác không tồn tại trên hệ thống');
            if (partner.status === 'Pending') throw new Error('Tai khoan dang cho xet duyet');
            if (partner.status === 'Rejected') throw new Error('Tai khoan da bi tu choi');
            
            // Chặn đăng nhập nếu đối tác bị khóa tài khoản
            if (partner.is_active === false) {
                throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.');
            }
            
        } else if (user.role === 'Customer') {
            const customerRes = await pool.query(
                'SELECT is_active FROM Customers WHERE user_id = $1', 
                [user.user_id]
            );
            const customer = customerRes.rows[0];
            
            if (!customer) throw new Error('Thông tin khách hàng không tồn tại trên hệ thống');
            
            // Chặn đăng nhập nếu khách hàng bị khóa tài khoản
            if (customer.is_active === false) {
                throw new Error('Tài khoản của bạn đang bị tạm khóa do vi phạm tiêu chuẩn. Vui lòng liên hệ tổng đài.');
            }
        }

        const accessToken = this.createAccessToken(user);
        const refreshToken = this.createRefreshToken(user);
        return {
            token: accessToken,
            accessToken,
            refreshToken,
            user: { id: user.user_id, username: user.username, role: user.role },
        };
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) throw new Error('Refresh token is required.');

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secretkey_tmdt'
        );
        if (decoded.type !== 'refresh') throw new Error('Invalid refresh token.');

        const { rows } = await pool.query(
            'SELECT user_id, username, role FROM Users WHERE user_id = $1',
            [decoded.id]
        );
        if (rows.length === 0) throw new Error('User not found.');

        const user = rows[0];
        const accessToken = this.createAccessToken(user);
        const nextRefreshToken = this.createRefreshToken(user);
        return {
            token: accessToken,
            accessToken,
            refreshToken: nextRefreshToken,
            user: { id: user.user_id, username: user.username, role: user.role },
        };
    }

    async getProfile(userId, role) {
        if (role === 'Partner') {
            const profileRes = await pool.query(
                `SELECT u.username, u.email, u.phone, u.role,
                        p.company_name, p.representative_name, p.tax_id, p.headquarters, p.status
                 FROM Users u
                 JOIN Partners p ON u.user_id = p.user_id
                 WHERE u.user_id = $1`,
                [userId]
            );
            const branchesRes = await pool.query('SELECT * FROM Branches WHERE partner_id = $1', [userId]);
            return { ...profileRes.rows[0], branches: branchesRes.rows };
        }

        const result = await pool.query(
            `SELECT u.username, u.email, u.phone, u.role, c.full_name, c.dob, c.address
             FROM Users u
             JOIN Customers c ON u.user_id = c.user_id
             WHERE u.user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    async updateProfile(userId, role, data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (data.email) {
                const emailExists = await client.query(
                    'SELECT user_id FROM Users WHERE lower(email) = lower($1) AND user_id <> $2',
                    [data.email, userId]
                );
                if (emailExists.rows.length > 0) throw new Error('Email nay da duoc su dung');
            }

            if (data.phone) {
                const phoneExists = await client.query(
                    'SELECT user_id FROM Users WHERE phone = $1 AND user_id <> $2',
                    [data.phone, userId]
                );
                if (phoneExists.rows.length > 0) throw new Error('So dien thoai nay da duoc su dung');
            }

            await client.query('UPDATE Users SET email = $1, phone = $2 WHERE user_id = $3', [
                data.email,
                data.phone,
                userId,
            ]);

            if (role === 'Partner') {
                await client.query(
                    'UPDATE Partners SET company_name = $1, representative_name = $2, tax_id = $3, headquarters = $4 WHERE user_id = $5',
                    [data.company_name, data.representative_name, data.tax_id, data.headquarters, userId]
                );

                if (data.branches) {
                    const keptBranchIds = data.branches
                        .map((branch) => Number(branch.branch_id))
                        .filter(Boolean);

                    if (keptBranchIds.length > 0) {
                        await client.query(
                            `DELETE FROM Branches
                             WHERE partner_id = $1
                             AND NOT (branch_id = ANY($2::int[]))
                             AND NOT EXISTS (
                                SELECT 1 FROM E_Vouchers ev WHERE ev.used_at_branch_id = Branches.branch_id
                             )`,
                            [userId, keptBranchIds]
                        );
                    } else {
                        await client.query(
                            `DELETE FROM Branches
                             WHERE partner_id = $1
                             AND NOT EXISTS (
                                SELECT 1 FROM E_Vouchers ev WHERE ev.used_at_branch_id = Branches.branch_id
                             )`,
                            [userId]
                        );
                    }

                    for (const branch of data.branches) {
                        if (branch.branch_name?.trim()) {
                            if (branch.branch_id) {
                                await client.query(
                                    `UPDATE Branches
                                     SET branch_name = $1, address = $2, phone = $3
                                     WHERE branch_id = $4 AND partner_id = $5`,
                                    [branch.branch_name, branch.address, branch.phone, branch.branch_id, userId]
                                );
                            } else {
                                await client.query(
                                    'INSERT INTO Branches (partner_id, branch_name, address, phone) VALUES ($1, $2, $3, $4)',
                                    [userId, branch.branch_name, branch.address, branch.phone]
                                );
                            }
                        }
                    }
                }
            } else {
                await client.query(
                    'UPDATE Customers SET full_name = $1, dob = $2, address = $3 WHERE user_id = $4',
                    [data.full_name, data.dob, data.address, userId]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async changePassword(userId, oldPassword, newPassword) {
        const result = await pool.query('SELECT password FROM Users WHERE user_id = $1', [userId]);
        const isMatch = await bcrypt.compare(oldPassword, result.rows[0].password);
        if (!isMatch) throw new Error('Mat khau cu khong chinh xac');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password = $1 WHERE user_id = $2', [hashedPassword, userId]);
    }

    async forgotPassword(data) {
        const { email, phone, role } = data;
        const user = await this.findResetUser({ email, phone, role });

        // Always generate a 6-digit OTP code for both email and phone
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        await pool.query(
            'UPDATE Users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
            [tokenHash, expiry, user.user_id]
        );

        if (email) {
            await sendEmail({
                email: user.email,
                subject: 'Dealzy - Mã OTP khôi phục mật khẩu',
                template: {
                    title: 'Khôi phục mật khẩu',
                    intro: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ bạn.',
                    body: `<p style="font-size: 16px; margin: 0;">Mã OTP xác minh của bạn là:</p>
                           <p style="font-size: 32px; font-weight: 800; color: #0f4c81; letter-spacing: 4px; margin: 10px 0; text-align: center;">${otp}</p>
                           <p style="font-size: 14px; color: #64748b; margin: 0;">Mã OTP này có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>`,
                    footer: 'Nếu bạn không yêu cầu, vui lòng bỏ qua email này.',
                },
            });
            return { message: 'Mã OTP khôi phục đã được gửi đến Email' };
        }

        const smsContent = `Ma xac minh Dealzy cua ban la: ${otp}`;
        const sent = await sendSms({ phone: user.phone, content: smsContent });
        if (!sent) {
            throw new Error('Không thể gửi tin nhắn SMS khôi phục mật khẩu. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.');
        }
        return { message: 'Ma OTP da duoc gui den SDT', otp };
    }

    async resetPassword(token, password) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'secretkey_tmdt'
            );
            if (decoded.type !== 'password_reset') throw new Error('Invalid reset token');

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'UPDATE Users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2 AND role = $3 RETURNING user_id',
                [hashedPassword, decoded.id, decoded.role]
            );
            if (result.rows.length === 0) throw new Error('Token khong hop le hoac da het han');
            return;
        } catch (err) {
            if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') throw err;
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const result = await pool.query(
            'SELECT * FROM Users WHERE reset_token = $1 AND reset_token_expiry > $2',
            [tokenHash, new Date()]
        );
        if (result.rows.length === 0) throw new Error('Token khong hop le hoac da het han');

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'UPDATE Users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2',
            [hashedPassword, result.rows[0].user_id]
        );
    }

    async verifyOtp(identifier, otp, role = null) {
        if (!identifier) throw new Error('Email hoặc số điện thoại là bắt buộc');
        const isEmail = identifier.includes('@');
        const user = await this.findResetUser({
            email: isEmail ? identifier : null,
            phone: !isEmail ? identifier : null,
            role,
        });
        const tokenHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (user.reset_token !== tokenHash || new Date(user.reset_token_expiry) < new Date()) {
            throw new Error('OTP khong chinh xac hoac da het han');
        }
        return this.createPasswordResetToken(user);
    }

    async checkAvailability(data) {
        const { username, email, phone } = data;
        const result = {
            available: true,
            username: true,
            email: true,
            phone: true,
            conflicts: [],
        };

        if (username) {
            const usernameExists = await pool.query('SELECT 1 FROM Users WHERE username = $1 LIMIT 1', [username]);
            result.username = usernameExists.rows.length === 0;
            if (!result.username) result.conflicts.push('username');
        }

        if (email) {
            const emailExists = await pool.query('SELECT 1 FROM Users WHERE lower(email) = lower($1) LIMIT 1', [email]);
            result.email = emailExists.rows.length === 0;
            if (!result.email) result.conflicts.push('email');
        }

        if (phone) {
            const phoneExists = await pool.query('SELECT 1 FROM Users WHERE phone = $1 LIMIT 1', [phone]);
            result.phone = phoneExists.rows.length === 0;
            if (!result.phone) result.conflicts.push('phone');
        }

        result.available = result.conflicts.length === 0;
        return result;
    }

    async sendVerificationOtp(data) {
        const { email, phone } = data;
        const identifier = email || phone;
        if (!identifier) throw new Error('Email hoặc số điện thoại là bắt buộc');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        registrationOtps.set(identifier, {
            otp,
            expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        if (email) {
            await sendEmail({
                email,
                subject: 'Dealzy - Mã xác minh đăng ký tài khoản',
                template: {
                    title: 'Xác minh đăng ký tài khoản',
                    intro: 'Cảm ơn bạn đã lựa chọn Dealzy. Đây là mã xác minh của bạn.',
                    body: `<p style="font-size: 16px; margin: 0;">Mã xác thực (OTP) của bạn là:</p>
                           <p style="font-size: 32px; font-weight: 800; color: #0f4c81; letter-spacing: 4px; margin: 10px 0; text-align: center;">${otp}</p>
                           <p style="font-size: 14px; color: #64748b; margin: 0;">Mã này có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã này với người khác.</p>`,
                    footer: 'Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.',
                },
            });
            return { message: 'Mã xác minh đã được gửi đến Email' };
        }

        const smsContent = `Ma xac minh dang ky Dealzy cua ban la: ${otp}`;
        const sent = await sendSms({ phone, content: smsContent });
        if (!sent) {
            throw new Error('Không thể gửi tin nhắn SMS xác thực. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.');
        }
        return { message: 'Mã xác minh đã được gửi đến SĐT', otp };
    }
}

module.exports = new AuthService();
