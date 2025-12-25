let  writePool  = require("../db/write.js"); 
 
async function createMetric(req, res) {
  const { service, cpu, memory } = req.body;

  if (!service || cpu == null || memory == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Ensure service exists (or create it)
    const serviceResult = await writePool.query(
      "INSERT INTO services (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [service]
    );

    const serviceId = serviceResult.rows[0].id;

    //  Insert metric
    await writePool.query(
      "INSERT INTO metrics (service_id, cpu_usage, memory_usage) VALUES ($1, $2, $3)",
      [serviceId, cpu, memory]
    );

    res.status(201).json({ message: "Metric stored successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { createMetric };
