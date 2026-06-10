const { Pool, types } = require('pg');
require('dotenv').config();

// PostgreSQL stores this schema's TIMESTAMP columns in UTC. By default, node-postgres
// interprets TIMESTAMP WITHOUT TIME ZONE as local server time, shifting JSON output.
types.setTypeParser(1114, (value) => new Date(`${value}Z`));

const useConnectionString = Boolean(process.env.DATABASE_URL);

const pool = new Pool(useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

module.exports = pool;
