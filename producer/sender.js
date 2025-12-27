const axios = require("axios");

async function sendMetrics(serviceId, payload) {
  await axios.post(`${process.env.BACKEND_URL}/metrics`, {
    service_id: serviceId,
    ...payload
  });
}

module.exports = { sendMetrics };
