const writePool = require("../db/writedb");
const { v4: uuidv4 } = require("uuid");

/**
 * Emit event to events table
 */
async function emitEvent(client, eventType, aggregateType, aggregateId, payload) {
  await client.query(
    `INSERT INTO events (event_type, aggregate_type, aggregate_id, payload, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [eventType, aggregateType, aggregateId, JSON.stringify(payload)]
  );
}

async function registerService(req, res) {
  const { name, hostname, os, version } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Service name required" });
  }

  const client = await writePool.connect();
  
  try {
    await client.query("BEGIN");

    const serviceId = uuidv4();

    // Insert service into write DB
    const result = await client.query(
      `INSERT INTO services (id, name, hostname, os, version, last_heartbeat, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [serviceId, name, hostname, os, version]
    );

    const service = result.rows[0];

    // Emit event for replication
    await emitEvent(
      client,
      "service_created",
      "service",
      service.id,
      {
        id: service.id,
        name: service.name,
        hostname: service.hostname,
        os: service.os,
        version: service.version,
        last_heartbeat: service.last_heartbeat,
        created_at: service.created_at
      }
    );

    await client.query("COMMIT");

    res.status(201).json({ 
      service_id: serviceId,
      message: "Service registered successfully",
      event_emitted: true
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error registering service:", err);
    res.status(500).json({ 
      error: "Failed to register service", 
      details: err.message 
    });
  } finally {
    client.release();
  }
}

module.exports = { registerService };