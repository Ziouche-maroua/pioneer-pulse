const si = require("systeminformation");

async function getSystemMetrics() {
  const load = await si.currentLoad();
  const mem = await si.mem();
   const disks = await si.fsSize();
   const net = await si.networkStats();
const graphics = await si.graphics();

  return {
    cpu_usage: Math.round(load.currentLoad),
    memory_usage: Math.round((mem.used / mem.total) * 100),
    load_avg: load.avgload,
     disks: disks.map(d => ({
      fs: d.fs,
      size: d.size,
      used: d.used,
      use: d.use
    })),
    network: net.map(n => ({
  iface: n.iface,
  rx_bytes: n.rx_bytes,
  tx_bytes: n.tx_bytes
})), 

gpu: graphics.controllers.map(g => ({
  model: g.model,
  memoryUsed: g.memoryUsed,
  temperature: g.temperatureGpu
}))

  };
}

module.exports = { getSystemMetrics };
