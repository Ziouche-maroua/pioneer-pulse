
const crypto = require('crypto');

// Sample service IDs (we should replace these with actual IDs from our db!!!!!!!!!!!!)
const SERVICE_IDS = [
  'service-uuid-1',
  'service-uuid-2',
  'service-uuid-3',
  'service-uuid-4',
  'service-uuid-5',
];

const PROCESS_NAMES = [
  'nginx',
  'node',
  'postgres',
  'redis-server',
  'python3',
  'docker',
  'systemd',
  'sshd',
];

// METRIC DATA GENERATORS

function generateMetricData(context, events, done) {
  // Random service
  context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
  
  // Realistic metric values
  context.vars.cpuUsage = (Math.random() * 100).toFixed(2);
  context.vars.memoryUsage = (Math.random() * 100).toFixed(2);
  context.vars.loadAvg = (Math.random() * 4).toFixed(2);
  context.vars.diskUsage = (Math.random() * 100).toFixed(2);
  context.vars.networkRx = Math.floor(Math.random() * 1000000000);
  context.vars.networkTx = Math.floor(Math.random() * 1000000000);
  context.vars.gpuUsage = Math.random() > 0.5 ? null : (Math.random() * 100).toFixed(2);
  
  return done();
}

function generateProcessData(context, events, done) {
  context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
  context.vars.processName = PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)];
  context.vars.pid = Math.floor(Math.random() * 65535) + 1;
  context.vars.cpuUsage = (Math.random() * 100).toFixed(2);
  context.vars.memoryUsage = (Math.random() * 100).toFixed(2);
  
  return done();
}

function generateTimeRange(context, events, done) {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  context.vars.fromTime = new Date(oneDayAgo).toISOString();
  context.vars.toTime = new Date(now).toISOString();
  
  return done();
}

function selectRandomService(context, events, done) {
  context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
  return done();
}

function now(context, events, done) {
  context.vars.timestamp = new Date().toISOString();
  return done();
}

function recordWriteTime(context, events, done) {
  context.vars.writeStartTime = Date.now();
  return done();
}

function calculateWriteLatency(context, events, done) {
  if (context.vars.writeStartTime) {
    const latency = Date.now() - context.vars.writeStartTime;
    console.log(`Write latency: ${latency}ms`);
  }
  return done();
}


function simulateSpike(context, events, done) {
  // Simulate sudden traffic spike
  const isSpike = Math.random() < 0.1; // 10% chance of spike
  context.vars.requestCount = isSpike ? 10 : 1;
  return done();
}

function businessHoursPattern(context, events, done) {
  const hour = new Date().getHours();
  
  // Higher load during business hours (9 AM - 5 PM)
  if (hour >= 9 && hour <= 17) {
    context.vars.loadMultiplier = 2;
  } else {
    context.vars.loadMultiplier = 1;
  }
  
  return done();
}

// VALIDATION FUNCTIONS
function validateMetricResponse(requestParams, response, context, ee, next) {
  if (response.statusCode === 201) {
    ee.emit('counter', 'metrics.created', 1);
  } else {
    ee.emit('counter', 'metrics.failed', 1);
  }
  return next();
}

function validateReadResponse(requestParams, response, context, ee, next) {
  if (response.statusCode === 200) {
    const responseTime = response.timings.end;
    
    // Track p95 latency
    if (responseTime < 50) {
      ee.emit('counter', 'reads.fast', 1); // < 50ms
    } else if (responseTime < 100) {
      ee.emit('counter', 'reads.acceptable', 1); // 50-100ms
    } else {
      ee.emit('counter', 'reads.slow', 1); // > 100ms
    }
  }
  return next();
}

// EXPORTS

module.exports = {
  generateMetricData,
  generateProcessData,
  generateTimeRange,
  selectRandomService,
  now,
  recordWriteTime,
  calculateWriteLatency,
  simulateSpike,
  businessHoursPattern,
  validateMetricResponse,
  validateReadResponse,
};