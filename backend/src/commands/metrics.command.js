
const writePool = require("../db/writedb");

async function createMetrics(req, res) {
  const { service_id, system, processes } = req.body;


  if (!service_id || !system) {
    return res.status(400).json({ error: "Invalid payload" });
  }


  // heartbeat
  await writePool.query(
    `UPDATE services SET last_heartbeat = NOW() WHERE id = $1`,
    [service_id]
  );

  // system metrics
  await writePool.query(
    `
    INSERT INTO system_metrics
    (service_id, cpu_usage, memory_usage, load_avg, disks, network, gpu)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      service_id,
      system.cpu_usage,
      system.memory_usage,
      system.load_avg,
      system.disks ? JSON.stringify(system.disks) : null,     
      system.network ? JSON.stringify(system.network) : null,  // Convert to JSON string
      system.gpu ? JSON.stringify(system.gpu) : null   
    ]
  );

  // process metrics (FIXED N+1 problem )
  if (Array.isArray(processes) && processes.length > 0) {
    const values = [];
    const placeholders = [];

    processes.forEach((p, index) => {
      const i = index * 5;
      placeholders.push(
        `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5})`
      );
      values.push(service_id, p.name, p.pid, p.cpu, p.memory);
    });

    await writePool.query(
      `
      INSERT INTO process_metrics
      (service_id, process_name, pid, cpu_usage, memory_usage)
      VALUES ${placeholders.join(",")}
      `,
      values
    );

  }

  res.status(201).json({ message: "Metrics stored" });
}

module.exports = { createMetrics };
