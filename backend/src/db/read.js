const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,       
  port: process.env.DB_PORT,        
  user: process.env.DB_USER,        
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,    
  options: '-c search_path=read_schema' 
});

pool.on('connect', () => {
  console.log('✅ Connected to Read Database');
  console.log('DB HOST =', process.env.READ_DB_HOST);
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;
