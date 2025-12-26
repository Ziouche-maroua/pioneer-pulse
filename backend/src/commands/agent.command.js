const writePool = require("../db/writedb");
const { v4: uuidv4 } = require("uuid");

async function registerAgent(req, res) {
  const { name, hostname, os, version } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Agent name required" });
  }

  const agentId = uuidv4();

  await writePool.query(
    `
    INSERT INTO agents (id, name, hostname, os, version, last_heartbeat)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (id) DO NOTHING
    `,
    [agentId, name, hostname, os, version]
  );

  res.status(201).json({ agent_id: agentId });
}

module.exports = { registerAgent };
