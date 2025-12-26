const si = require("systeminformation");

async function getSystemMetrics() {
  const load = await si.currentLoad();
  const mem = await si.mem();

  return {
    cpu_usage: Math.round(load.currentLoad),
    memory_usage: Math.round((mem.used / mem.total) * 100),
    load_avg: load.avgload
  };
}

module.exports = { getSystemMetrics };
