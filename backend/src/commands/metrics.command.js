const writePool = require("../db/writedb");

async function emitEvent(client, eventType, aggregateType, aggregateId, payload) {
  await client.query(
    `INSERT INTO events (event_type, aggregate_type, aggregate_id, payload, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [eventType, aggregateType, aggregateId, JSON.stringify(payload)]
  );
}

async function createMetrics(req, res) {
  const { service_id, system, processes } = req.body;

  if (!service_id || !system) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await writePool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update heartbeat
    await client.query(
      `UPDATE services SET last_heartbeat = NOW() WHERE id = $1`,
      [service_id]
    );

    // 2. Get service info for event payload
    const serviceResult = await client.query(
      `SELECT id, name, hostname, os, version, last_heartbeat FROM services WHERE id = $1`,
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    // 3. Insert system metrics
    const systemResult = await client.query(
      `INSERT INTO system_metrics
       (service_id, cpu_usage, memory_usage, load_avg, disk_usage, network_rx, network_tx, gpu_usage, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        service_id,
        system.cpu_usage,
        system.memory_usage,
        system.load_avg,
        system.disk_usage,
        system.network_rx || 0,
        system.network_tx || 0,
        system.gpu_usage
      ]
    );

    const metric = systemResult.rows[0];

    // 4. 🚀 EMIT EVENT for replication (THIS WAS MISSING!)
    await emitEvent(
      client,
      "system_metric_recorded",
      "system_metric",
      metric.id.toString(),
      {
        id: metric.id,
        service_id: service.id,
        service_name: service.name,
        service_hostname: service.hostname,
        service_os: service.os,
        service_version: service.version,
        service_last_heartbeat: service.last_heartbeat,
        cpu_usage: parseFloat(metric.cpu_usage),
        memory_usage: parseFloat(metric.memory_usage),
        load_avg: parseFloat(metric.load_avg),
        disk_usage: parseFloat(metric.disk_usage),
        network_rx: parseInt(metric.network_rx),
        network_tx: parseInt(metric.network_tx),
        gpu_usage: metric.gpu_usage ? parseFloat(metric.gpu_usage) : null,
        created_at: metric.created_at
      }
    );

    // 5. Insert process metrics (batched)
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

      const processResult = await client.query(
        `INSERT INTO process_metrics
         (service_id, process_name, pid, cpu_usage, memory_usage, created_at)
         VALUES ${placeholders.join(",")}
         RETURNING *`,
        values
      );

      // Emit events for process metrics
      for (const processMetric of processResult.rows) {
        await emitEvent(
          client,
          "process_metric_recorded",
          "process_metric",
          processMetric.id.toString(),
          {
            id: processMetric.id,
            service_id: service.id,
            service_name: service.name,
            process_name: processMetric.process_name,
            pid: processMetric.pid,
            cpu_usage: parseFloat(processMetric.cpu_usage),
            memory_usage: parseFloat(processMetric.memory_usage),
            created_at: processMetric.created_at
          }
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({ 
      message: "Metrics stored",
      metric_id: metric.id,
      events_emitted: processes ? processes.length + 1 : 1
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error storing metrics:", err);
    res.status(500).json({ error: "Failed to store metrics", details: err.message });
  } finally {
    client.release();
  }
}

module.exports = { createMetrics };