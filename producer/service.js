const os = require("os");
const axios = require("axios");

const BACKEND = process.env.BACKEND_URL || "http://localhost:3000";

async function registerService() {
  const res = await axios.post(`${BACKEND}/service/register`, {
    name: process.env.SERVICE_NAME,
    hostname: os.hostname(),
    os: os.platform(),
    version: "1.0.0"
  });

  return res.data.service_id;
}

module.exports = { registerService };
