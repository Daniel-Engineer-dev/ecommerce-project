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
