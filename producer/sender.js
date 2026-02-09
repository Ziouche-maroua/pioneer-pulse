const axios = require("axios");

async function sendMetrics(serviceId, payload) {
  try {
    await axios.post(`${process.env.BACKEND_URL}/metrics`, {
      service_id: serviceId,
      system: payload.system,
      processes: payload.processes || []
    });
  } catch (err) {
    console.error(
      "Metrics send failed:",
      err.response?.data || err.message
    );
  }
}

module.exports = { sendMetrics };
