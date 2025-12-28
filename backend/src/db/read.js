const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.READ_DB_HOST,
  port: Number(process.env.READ_DB_PORT),
  database: process.env.READ_DB_NAME,
  user: process.env.READ_DB_USER,
  password: process.env.READ_DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('✅ Connected to Read Database');
  console.log('DB HOST =', process.env.READ_DB_HOST);
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;
