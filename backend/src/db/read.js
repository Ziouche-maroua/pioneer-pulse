const { Pool } = require("pg");
require("dotenv").config();

const readPool = new Pool({
  host: process.env.READ_DB_HOST,
  port: process.env.READ_DB_PORT,
  user: process.env.READ_DB_USER,
  password: process.env.READ_DB_PASSWORD,
  database: process.env.READ_DB_NAME,
});

readPool.on("connect", () => {
  console.log("✅ Connected to Read DB");
});

module.exports = readPool;