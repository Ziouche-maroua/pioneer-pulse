require("dotenv").config();
const { Pool } = require("pg");


 // WRITE database connection
 
const writeDB = new Pool({
  host: process.env.WRITE_DB_HOST || "localhost",
  port: process.env.WRITE_DB_PORT || 5433,
  user: process.env.WRITE_DB_USER || "writeuser",
  password: process.env.WRITE_DB_PASSWORD || "writepass",
  database: process.env.WRITE_DB_NAME || "pioneerpulse_write",
});


 // READ database connection

const readDB = new Pool({
  host: process.env.READ_DB_HOST || "localhost",
  port: process.env.READ_DB_PORT || 5434,
  user: process.env.READ_DB_USER || "readuser",
  password: process.env.READ_DB_PASSWORD || "readpass",
  database: process.env.READ_DB_NAME || "pioneerpulse_read",
});


 // Sync logic (MVP)
 
async function syncMetrics() {
  try {
    console.log(" Sync started...");

    // 1 Read aggregated metrics from WRITE DB
    const { rows } = await writeDB.query(`
      SELECT
        s.name AS service_name,
        AVG(m.cpu_usage) AS avg_cpu,
        AVG(m.memory_usage) AS avg_memory
      FROM metrics m
      JOIN services s ON s.id = m.service_id
      WHERE m.created_at > now() - interval '5 minutes'
      GROUP BY s.name;
    `);

    
    // 2 Insert / update into READ DB
    for (const row of rows) {
      await readDB.query(
        `
        INSERT INTO service_metrics_summary
          (service_name, avg_cpu, avg_memory, last_updated)
        VALUES ($1, $2, $3, now())
        ON CONFLICT (service_name)
        DO UPDATE SET
          avg_cpu = EXCLUDED.avg_cpu,
          avg_memory = EXCLUDED.avg_memory,
          last_updated = now();
        `,
        [row.service_name, row.avg_cpu, row.avg_memory]
      );
    }

    console.log(`✅ Sync completed (${rows.length} services)`);
  } catch (err) {
    console.error("❌ Sync error:", err.message);
  }
}


 // Run sync every 5 seconds
 
setInterval(syncMetrics, 5000);

// Run immediately on start
syncMetrics();
