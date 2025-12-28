const { Client } = require('pg');

// Global state for service IDs
let SERVICE_IDS = [];
let servicesLoaded = false;

const PROCESS_NAMES = [
  'nginx', 'node', 'postgres', 'redis-server', 'python3',
  'docker', 'systemd', 'sshd', 'cron', 'rsyslog'
];


async function loadServiceIds() {
  if (servicesLoaded && SERVICE_IDS.length > 0) {
    return SERVICE_IDS;
  }

  const client = new Client({
    host: process.env.WRITE_DB_HOST || 'localhost',
    port: process.env.WRITE_DB_PORT || 5432,
    user: process.env.WRITE_DB_USER || 'writeuser',
    password: process.env.WRITE_DB_PASSWORD || 'writepass',
    database: process.env.WRITE_DB_NAME || 'pioneerpulse_write',
  });

  try {
    await client.connect();
    
    const result = await client.query('SELECT id FROM services ORDER BY created_at DESC LIMIT 10');
    
    if (result.rows.length === 0) {
      throw new Error('No services found in database! Run seeding first.');
    }
    
    SERVICE_IDS = result.rows.map(row => row.id);
    servicesLoaded = true;
    
    console.log(`Loaded ${SERVICE_IDS.length} real service UUIDs for testing`);
    console.log(`Sample IDs: ${SERVICE_IDS.slice(0, 3).join(', ')}`);
    
    await client.end();
    return SERVICE_IDS;
  } catch (err) {
    console.error('Failed to load service IDs:', err.message);
    console.error('Make sure database is seeded and accessible');
    
    await client.end();
    throw err;
  }
}

async function generateMetricData(context, events, done) {
  try {
    if (!servicesLoaded) {
      await loadServiceIds();
    }
    
    context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
    context.vars.cpuUsage = parseFloat((Math.random() * 100).toFixed(2));
    context.vars.memoryUsage = parseFloat((Math.random() * 100).toFixed(2));
    context.vars.loadAvg = parseFloat((Math.random() * 4).toFixed(2));
    context.vars.diskUsage = parseFloat((Math.random() * 100).toFixed(2));
    context.vars.networkRx = Math.floor(Math.random() * 1000000000);
    context.vars.networkTx = Math.floor(Math.random() * 1000000000);
    context.vars.gpuUsage = Math.random() > 0.5 ? null : parseFloat((Math.random() * 100).toFixed(2));
    
    return done();
  } catch (err) {
    console.error('Error generating metric data:', err.message);
    return done(err);
  }
}

async function generateProcessData(context, events, done) {
  try {
    if (!servicesLoaded) {
      await loadServiceIds();
    }
    
    context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
    context.vars.processName = PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)];
    context.vars.pid = Math.floor(Math.random() * 65535) + 1;
    context.vars.cpuUsage = parseFloat((Math.random() * 100).toFixed(2));
    context.vars.memoryUsage = parseFloat((Math.random() * 100).toFixed(2));
    
    return done();
  } catch (err) {
    return done(err);
  }
}

function generateTimeRange(context, events, done) {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  context.vars.fromTime = new Date(oneDayAgo).toISOString();
  context.vars.toTime = new Date(now).toISOString();
  
  return done();
}


async function selectRandomService(context, events, done) {
  try {
    if (!servicesLoaded) {
      await loadServiceIds();
    }
    
    context.vars.serviceId = SERVICE_IDS[Math.floor(Math.random() * SERVICE_IDS.length)];
    return done();
  } catch (err) {
    return done(err);
  }
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
    const responseTime = response.timings?.end || 0;
    
    if (responseTime < 50) {
      ee.emit('counter', 'reads.fast', 1);
    } else if (responseTime < 100) {
      ee.emit('counter', 'reads.acceptable', 1);
    } else {
      ee.emit('counter', 'reads.slow', 1);
    }
  }
  return next();
}

module.exports = {
  generateMetricData,
  generateProcessData,
  generateTimeRange,
  selectRandomService,
  now,
  recordWriteTime,
  calculateWriteLatency,
  validateMetricResponse,
  validateReadResponse,
  loadServiceIds,
};
