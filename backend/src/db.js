const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.WRITE_DB_HOST,
  port: process.env.WRITE_DB_PORT,
  user: process.env.WRITE_DB_USER,
  password: process.env.WRITE_DB_PASSWORD,
  database: process.env.WRITE_DB_NAME,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

module.exports = pool;
