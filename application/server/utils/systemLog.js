const pool = require('../config/db');

async function logAction(userId, action, tableName = null, recordId = null) {
    try {
        await pool.query(
            `
                INSERT INTO System_Logs (user_id, action, table_name, record_id)
                VALUES ($1, $2, $3, $4)
            `,
            [userId || null, action, tableName, recordId ? Number(recordId) : null]
        );
    } catch (error) {
        console.warn('Could not write system log:', error.message);
    }
}

module.exports = { logAction };
