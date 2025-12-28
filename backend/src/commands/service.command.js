const writePool = require("../db/writedb");
const { v4: uuidv4 } = require("uuid");

async function registerService(req, res) {
  const { name, hostname, os, version } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Service name required" });
  }

  const serviceId = uuidv4();

  await writePool.query(
    `
    INSERT INTO services (id, name, hostname, os, version, last_heartbeat)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (id) DO NOTHING
    `,
    [serviceId, name, hostname, os, version]
  );

  res.status(201).json({ service_id: serviceId });
}

module.exports = { registerService };