const si = require("systeminformation");

async function getSystemMetrics() {
  const load = await si.currentLoad();
  const mem = await si.mem();
  const disks = await si.fsSize();
  const net = await si.networkStats();
  const graphics = await si.graphics();

  // Calculate total disk usage across all disks
  const totalDiskSize = disks.reduce((sum, d) => sum + (d.size || 0), 0);
  const totalDiskUsed = disks.reduce((sum, d) => sum + (d.used || 0), 0);
  const diskUsagePercent = totalDiskSize > 0 
    ? Math.round((totalDiskUsed / totalDiskSize) * 100) 
    : 0;

  // Calculate total network traffic
  const totalRxBytes = net.reduce((sum, n) => sum + (n.rx_bytes || 0), 0);
  const totalTxBytes = net.reduce((sum, n) => sum + (n.tx_bytes || 0), 0);

  // Get primary GPU info (first one)
  const primaryGpu = graphics.controllers[0];

  return {
    cpu_usage: Math.round(load.currentLoad),
    memory_usage: Math.round((mem.used / mem.total) * 100),
    load_avg: load.avgLoad || 0,
    disk_usage: diskUsagePercent,           // Single percentage
    network_rx: totalRxBytes,                // Total received bytes
    network_tx: totalTxBytes,                // Total transmitted bytes
    gpu_usage: primaryGpu?.memoryUsed || 0   // GPU memory used (MB)
  };
}

module.exports = { getSystemMetrics };