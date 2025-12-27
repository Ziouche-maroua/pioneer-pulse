const writePool = require("../db/writedb");

async function createMetrics(req, res) {
  const { service_id, system, processes } = req.body;

  if (!service_id || !system) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // update heartbeat :))
  await writePool.query(
    `UPDATE services SET last_heartbeat = NOW() WHERE id = $1`,
    [service_id]
  );

  // system metrics
  await writePool.query(
    `
    INSERT INTO system_metrics
    (service_id, cpu_usage, memory_usage, load_avg)
    VALUES ($1, $2, $3, $4)
    `,
    [
      service_id,
      system.cpu_usage,
      system.memory_usage,
      system.load_avg
    ]
  );

  // process metrics
  if (Array.isArray(processes)) {
    for (const p of processes) {
      await writePool.query(
        `
        INSERT INTO process_metrics
        (service_id, process_name, pid, cpu_usage, memory_usage)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [service_id, p.name, p.pid, p.cpu, p.memory]
      );
    }
  }

  res.status(201).json({ message: "Metrics stored" });
}

module.exports = { createMetrics };
