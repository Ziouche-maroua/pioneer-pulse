const axios = require("axios");

async function sendMetrics(agentId, payload) {
  await axios.post(`${process.env.BACKEND_URL}/metrics`, {
    agent_id: agentId,
    ...payload
  });
}

module.exports = { sendMetrics };
