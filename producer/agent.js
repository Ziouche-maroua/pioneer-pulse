const os = require("os");
const axios = require("axios");

const BACKEND = process.env.BACKEND_URL;

async function registerAgent() {
  const res = await axios.post(`${BACKEND}/agents/register`, {
    name: process.env.SERVICE_NAME,
    hostname: os.hostname(),
    os: os.platform(),
    version: "1.0.0"
  });

  return res.data.agent_id;
}

module.exports = { registerAgent };
