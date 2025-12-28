require('dotenv').config();
const { registerService } = require("./service");
const { getSystemMetrics } = require("./metrics/system");
const { getProcessMetrics } = require("./metrics/processes");
const { sendMetrics } = require("./sender");


(async () => {
  const serviceId = await registerService();
  console.log(" Service registered:", serviceId);

  setInterval(async () => {
    const system = await getSystemMetrics();
    const processes = await getProcessMetrics();

    await sendMetrics(serviceId, { system, processes });
    console.log("📡 Metrics sent");
  }, 5000);
})();
