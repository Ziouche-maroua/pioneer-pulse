const { registerAgent } = require("./agent");
const { getSystemMetrics } = require("./metrics/system");
const { getProcessMetrics } = require("./metrics/processes");
const { sendMetrics } = require("./sender");

(async () => {
  const agentId = await registerAgent();
  console.log("🆔 Agent registered:", agentId);

  setInterval(async () => {
    const system = await getSystemMetrics();
    const processes = await getProcessMetrics();

    await sendMetrics(agentId, { system, processes });
    console.log("📡 Metrics sent");
  }, 5000);
})();
