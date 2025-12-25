const os = require("os");
const axios = require("axios");

const BACKEND_URL = "http://localhost:3000/metrics";
const SERVICE_NAME = "local-agent";

// CPU usage
function getCPUUsage() {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  });

  return {
    idle,
    total
  };
}

let lastCPU = getCPUUsage();

function calculateCPUPercent() {
  const currentCPU = getCPUUsage();

  const idleDiff = currentCPU.idle - lastCPU.idle;
  const totalDiff = currentCPU.total - lastCPU.total;

  lastCPU = currentCPU;

  return 100 - Math.round((idleDiff / totalDiff) * 100);
}

// memory
function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return Math.round((used / total) * 100);
}

// send metrics
async function sendMetrics() {
  const cpu = calculateCPUPercent();
  const memory = getMemoryUsage();

  try {
    await axios.post(BACKEND_URL, {
      service: SERVICE_NAME,
      cpu,
      memory
    });

    console.log(`📊 Sent metrics | CPU: ${cpu}% | MEM: ${memory}%`);
  } catch (err) {
    console.error("❌ Failed to send metrics");
  }
}

// Send every 5 seconds
setInterval(sendMetrics, 5000);
