const si = require("systeminformation");

async function getProcessMetrics() {
  const data = await si.processes();

  return data.list
    .filter(p => p.cpu > 0.5)
    .slice(0, 5)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: Math.round(p.cpu),
      memory: Math.round(p.mem)
    }));
}

module.exports = { getProcessMetrics };
