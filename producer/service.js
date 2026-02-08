const os = require("os");
const axios = require("axios");

const BACKEND =
  process.env.BACKEND_URL ||
  "https://pioneer-pulse-backend.onrender.com";

const SERVICE_NAME =
  process.env.SERVICE_NAME ||
  `producer-${os.hostname()}` ||
  "producer-unknown";

async function registerService() {
  try {
    const res = await axios.post(`${BACKEND}/service/register`, {
      name: SERVICE_NAME,
      hostname: os.hostname(),
      os: os.platform(),
      version: "1.0.0"
    });

    console.log("Service registered");
    return res.data.service_id;

  } catch (err) {
    console.error("Service registration failed:");
    console.error(err.response?.data || err.message);

    // DO NOT crash app
    return null;
  }
}

module.exports = { registerService };
