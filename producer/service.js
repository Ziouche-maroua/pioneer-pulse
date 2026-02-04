const os = require("os");
const axios = require("axios");

const BACKEND = process.env.BACKEND_URL || "http://localhost:3000";
const SERVICE_NAME =`producer-${os.hostname()}` ||  process.env.SERVICE_NAME || 'producer-unknown';
async function registerService() {
  const res = await axios.post(`${BACKEND}/service/register`, {
    name: SERVICE_NAME,
    hostname: os.hostname(),
    os: os.platform(),
    version: "1.0.0"
  });

  return res.data.service_id;
}

module.exports = { registerService };
