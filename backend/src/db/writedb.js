const { Pool } = require("pg");
require("dotenv").config();

const writePool = new Pool({
  host: process.env.DB_HOST,        
  port: process.env.DB_PORT,         
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,     
  options: '-c search_path=write_schema' 
});

writePool.on("connect", () => {
  console.log("✅ Connected to Write DB");
});

module.exports = writePool;