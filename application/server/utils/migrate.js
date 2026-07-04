const pool = require('../config/db');

async function migrate() {
    try {
        console.log('Bắt đầu chạy migration cơ sở dữ liệu cho Orders...');
        const queries = [
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);`,
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);`,
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(100);`,
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20);`,
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(100);`,
            `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;`,
            `ALTER TABLE Vouchers ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;`,
            `ALTER TABLE Vouchers ADD COLUMN IF NOT EXISTS rejected_reason TEXT;`,
            `ALTER TABLE Users ADD COLUMN IF NOT EXISTS admin_scope VARCHAR(30);`,
            `UPDATE Users SET admin_scope = 'SuperAdmin' WHERE role = 'Admin' AND admin_scope IS NULL;`,
            `ALTER TABLE Users DROP CONSTRAINT IF EXISTS users_admin_scope_check;`,
            `ALTER TABLE Users ADD CONSTRAINT users_admin_scope_check CHECK (admin_scope IS NULL OR admin_scope IN ('SuperAdmin', 'PartnerModerator', 'VoucherModerator', 'OrderManager', 'ContentEditor', 'SupportAgent'));`,
            `ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`,
            `UPDATE Users SET is_active = TRUE WHERE is_active IS NULL;`,
            `
                CREATE TABLE IF NOT EXISTS Content_Items (
                    content_id SERIAL PRIMARY KEY,
                    content_key VARCHAR(80) UNIQUE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    type VARCHAR(30) NOT NULL DEFAULT 'policy',
                    body TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `,
            `
                CREATE TABLE IF NOT EXISTS Voucher_Branches (
                    voucher_id INT REFERENCES Vouchers(voucher_id) ON DELETE CASCADE,
                    branch_id INT REFERENCES Branches(branch_id) ON DELETE CASCADE,
                    PRIMARY KEY (voucher_id, branch_id)
                );
            `,
            `
                INSERT INTO Voucher_Branches (voucher_id, branch_id)
                SELECT v.voucher_id, b.branch_id
                FROM Vouchers v
                JOIN Branches b ON b.partner_id = v.partner_id
                ON CONFLICT DO NOTHING;
            `
        ];
        
        for (const query of queries) {
            await pool.query(query);
            console.log(`Thực thi thành công: ${query}`);
        }
        console.log('Migration hoàn tất thành công!');
        process.exit(0);
    } catch (err) {
        console.error('Migration thất bại:', err);
        process.exit(1);
    }
}

migrate();
