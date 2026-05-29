const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/sendEmail');
const sendSms = require('../../utils/sendSms');

class AuthService {
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
            } = data;

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
        if (result.rows.length === 0) throw new Error('Tai khoan khong ton tai');

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Mat khau khong chinh xac');

        if (user.role === 'Partner') {
            const partnerRes = await pool.query('SELECT status FROM Partners WHERE user_id = $1', [user.user_id]);
            if (partnerRes.rows[0].status === 'Pending') throw new Error('Tai khoan dang cho xet duyet');
            if (partnerRes.rows[0].status === 'Rejected') throw new Error('Tai khoan da bi tu choi');
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
        const { email, phone } = data;
        const result = await pool.query(
            email ? 'SELECT * FROM Users WHERE email = $1' : 'SELECT * FROM Users WHERE phone = $1',
            [email || phone]
        );
        const user = result.rows[0];
        if (!user) throw new Error(email ? 'Email khong ton tai' : 'So dien thoai khong ton tai');

        const resetToken = email
            ? crypto.randomBytes(32).toString('hex')
            : Math.floor(100000 + Math.random() * 900000).toString();
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiry = new Date(Date.now() + (email ? 15 : 5) * 60 * 1000);

        await pool.query(
            'UPDATE Users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
            [tokenHash, expiry, user.user_id]
        );

        if (email) {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await sendEmail({
                email: user.email,
                subject: 'Dealzy - Khoi phuc mat khau',
                template: {
                    title: 'Khoi phuc mat khau',
                    intro: 'Chung toi da nhan duoc yeu cau dat lai mat khau cho tai khoan cua ban.',
                    body: 'Nhan nut ben duoi de thiet lap mat khau moi. Lien ket chi co hieu luc trong 15 phut.',
                    buttonText: 'Dat lai mat khau',
                    buttonUrl: resetUrl,
                    footer: 'Neu ban khong yeu cau, hay bo qua email nay.',
                },
            });
            return 'Link khoi phuc da duoc gui den Email';
        }

        await sendSms({ phone: user.phone, content: `Ma OTP cua ban la: ${resetToken}` });
        return 'Ma OTP da duoc gui den SDT';
    }

    async resetPassword(token, password) {
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

    async verifyOtp(phone, otp) {
        const result = await pool.query('SELECT * FROM Users WHERE phone = $1', [phone]);
        if (result.rows.length === 0) throw new Error('Nguoi dung khong ton tai');
        const tokenHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (result.rows[0].reset_token !== tokenHash || new Date(result.rows[0].reset_token_expiry) < new Date()) {
            throw new Error('OTP khong chinh xac hoac da het han');
        }
        return otp;
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
}

module.exports = new AuthService();
