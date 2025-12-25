let  readPool = require('../db/read.js');

/**
 * GET /dashboard
 */
async function getDashboard(req, res) {
  try {
    const { rows } = await readPool.query(`
      SELECT
        service_name,
        avg_cpu,
        avg_memory,
        last_updated
      FROM service_metrics_summary
      ORDER BY service_name;
    `);

    res.json({
      updated_at: new Date(),
      services: rows,
    });
  } catch (err) {
    console.error("Dashboard query error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
}

module.exports = getDashboard;
