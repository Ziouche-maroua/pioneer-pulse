require("dotenv").config();
const { Pool } = require("pg");

// DATABASE CONNECTIONS

const writeDB = new Pool({
  host: process.env.WRITE_DB_HOST || "localhost",
  port: process.env.WRITE_DB_PORT || 5433,
  user: process.env.WRITE_DB_USER || "writeuser",
  password: process.env.WRITE_DB_PASSWORD || "writepass",
  database: process.env.WRITE_DB_NAME || "pioneerpulse_write",
  max: 10, 
});

const readDB = new Pool({
  host: process.env.READ_DB_HOST || "localhost",
  port: process.env.READ_DB_PORT || 5434,
  user: process.env.READ_DB_USER || "readuser",
  password: process.env.READ_DB_PASSWORD || "readpass",
  database: process.env.READ_DB_NAME || "pioneerpulse_read",
  max: 10,
});

const metrics = {
  eventsProcessed: 0,
  eventsErrored: 0,
  processingTimeMs: [],
  lastProcessedAt: null,
  currentBacklog: 0,
  notificationsReceived: 0,
  batchesProcessed: 0,
};

function recordProcessingTime(ms) {
  metrics.processingTimeMs.push(ms);
  if (metrics.processingTimeMs.length > 100) {
    metrics.processingTimeMs.shift();
  }
}

function getAverageProcessingTime() {
  if (metrics.processingTimeMs.length === 0) return 0;
  const sum = metrics.processingTimeMs.reduce((a, b) => a + b, 0);
  return (sum / metrics.processingTimeMs.length).toFixed(2);
}

async function saveReplicationMetrics(lagSeconds) {
  try {
    await readDB.query(
      `INSERT INTO replication_metrics 
       (events_processed, events_pending, lag_seconds, processing_time_ms)
       VALUES ($1, $2, $3, $4)`,
      [
        metrics.eventsProcessed,
        metrics.currentBacklog,
        lagSeconds,
        parseFloat(getAverageProcessingTime()),
      ]
    );
  } catch (err) {
    console.error("Failed to save replication metrics:", err.message);
  }
}

//i've added this function to determine service status based on cpu, memory, and last heartbeat
function determineServiceStatus(cpu, memory, lastHeartbeat) {
  const now = new Date();
  const heartbeatAge = (now - new Date(lastHeartbeat)) / 1000; // seconds
  
  if (heartbeatAge > 300) return 'inactive'; // No heartbeat for 5 minutes
  if (cpu > 90 || memory > 90) return 'critical';
  if (cpu > 75 || memory > 75) return 'warning';
  return 'active';
}

function calculateTrend(current, previous) {
  if (!previous) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 2) return 'stable'; // Less than 2% change
  return diff > 0 ? 'up' : 'down';
}

//i've edited this function to handle 'metric_recorded' events after we added new views and tables
async function handleSystemMetricRecorded(event) {
  const data = event.payload;
  const readClient = await readDB.connect();

  try {
    await readClient.query("BEGIN");

    // 1. Update system_metrics_latest_view
    const previousResult = await readClient.query(
      'SELECT cpu_usage, memory_usage, disk_usage FROM system_metrics_latest_view WHERE service_id = $1',
      [data.service_id]
    );
    const previous = previousResult.rows[0];

    await readClient.query(
      `INSERT INTO system_metrics_latest_view 
       (service_id, service_name, cpu_usage, memory_usage, disk_usage, load_avg, 
        network_rx, network_tx, gpu_usage, cpu_trend, memory_trend, disk_trend, 
        latest_timestamp, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       ON CONFLICT (service_id) 
       DO UPDATE SET 
         cpu_usage = EXCLUDED.cpu_usage,
         memory_usage = EXCLUDED.memory_usage,
         disk_usage = EXCLUDED.disk_usage,
         load_avg = EXCLUDED.load_avg,
         network_rx = EXCLUDED.network_rx,
         network_tx = EXCLUDED.network_tx,
         gpu_usage = EXCLUDED.gpu_usage,
         cpu_trend = EXCLUDED.cpu_trend,
         memory_trend = EXCLUDED.memory_trend,
         disk_trend = EXCLUDED.disk_trend,
         latest_timestamp = EXCLUDED.latest_timestamp,
         updated_at = NOW()`,
      [
        data.service_id,
        data.service_name,
        data.cpu_usage,
        data.memory_usage,
        data.disk_usage,
        data.load_avg,
        data.network_rx,
        data.network_tx,
        data.gpu_usage,
        calculateTrend(data.cpu_usage, previous?.cpu_usage),
        calculateTrend(data.memory_usage, previous?.memory_usage),
        calculateTrend(data.disk_usage, previous?.disk_usage),
        data.created_at
      ]
    );


    // Update hourly aggregation
    const createdAt = new Date(data.created_at);
    const hourTimestamp = new Date(createdAt);
    hourTimestamp.setMinutes(0, 0, 0);

    await readClient.query(
      `INSERT INTO system_metrics_hourly_agg 
       (service_id, hour_timestamp, avg_cpu, min_cpu, max_cpu, 
        avg_memory, min_memory, max_memory, avg_disk, min_disk, max_disk,
        avg_load, min_load, max_load, total_network_rx, total_network_tx,
        avg_gpu, max_gpu, sample_count)
       VALUES ($1, $2, $3, $3, $3, $4, $4, $4, $5, $5, $5, $6, $6, $6, $7, $8, $9, $9, 1)
       ON CONFLICT (service_id, hour_timestamp)
       DO UPDATE SET
         avg_cpu = ((system_metrics_hourly_agg.avg_cpu * system_metrics_hourly_agg.sample_count + EXCLUDED.avg_cpu) 
                    / (system_metrics_hourly_agg.sample_count + 1)),
         min_cpu = LEAST(system_metrics_hourly_agg.min_cpu, EXCLUDED.min_cpu),
         max_cpu = GREATEST(system_metrics_hourly_agg.max_cpu, EXCLUDED.max_cpu),
         avg_memory = ((system_metrics_hourly_agg.avg_memory * system_metrics_hourly_agg.sample_count + EXCLUDED.avg_memory) 
                       / (system_metrics_hourly_agg.sample_count + 1)),
         min_memory = LEAST(system_metrics_hourly_agg.min_memory, EXCLUDED.min_memory),
         max_memory = GREATEST(system_metrics_hourly_agg.max_memory, EXCLUDED.max_memory),
         avg_disk = ((COALESCE(system_metrics_hourly_agg.avg_disk, 0) * system_metrics_hourly_agg.sample_count + COALESCE(EXCLUDED.avg_disk, 0)) 
                     / (system_metrics_hourly_agg.sample_count + 1)),
         min_disk = LEAST(system_metrics_hourly_agg.min_disk, EXCLUDED.min_disk),
         max_disk = GREATEST(system_metrics_hourly_agg.max_disk, EXCLUDED.max_disk),
         avg_load = ((COALESCE(system_metrics_hourly_agg.avg_load, 0) * system_metrics_hourly_agg.sample_count + COALESCE(EXCLUDED.avg_load, 0)) 
                     / (system_metrics_hourly_agg.sample_count + 1)),
         total_network_rx = system_metrics_hourly_agg.total_network_rx + COALESCE(EXCLUDED.total_network_rx, 0),
         total_network_tx = system_metrics_hourly_agg.total_network_tx + COALESCE(EXCLUDED.total_network_tx, 0),
         avg_gpu = ((COALESCE(system_metrics_hourly_agg.avg_gpu, 0) * system_metrics_hourly_agg.sample_count + COALESCE(EXCLUDED.avg_gpu, 0)) 
                    / (system_metrics_hourly_agg.sample_count + 1)),
         max_gpu = GREATEST(COALESCE(system_metrics_hourly_agg.max_gpu, 0), COALESCE(EXCLUDED.max_gpu, 0)),
         sample_count = system_metrics_hourly_agg.sample_count + 1`,
      [
        data.service_id,
        hourTimestamp,
        data.cpu_usage,
        data.memory_usage,
        data.disk_usage,
        data.load_avg,
        data.network_rx || 0,
        data.network_tx || 0,
        data.gpu_usage
      ]
    );

    // Update services_status_view
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const avgResult = await readClient.query(
      `SELECT 
         COALESCE(AVG(cpu_usage), 0) as avg_cpu,
         COALESCE(AVG(memory_usage), 0) as avg_memory,
         COALESCE(AVG(disk_usage), 0) as avg_disk
       FROM system_metrics_latest_view 
       WHERE service_id = $1 AND latest_timestamp > $2`,
      [data.service_id, oneHourAgo]
    );

    const status = determineServiceStatus(
      data.cpu_usage, 
      data.memory_usage, 
      data.service_last_heartbeat || new Date()
    );

    await readClient.query(
      `INSERT INTO services_status_view 
       (service_id, name, hostname, os, version, status, last_heartbeat,
        latest_cpu, latest_memory, latest_disk, latest_load_avg,
        avg_cpu_1h, avg_memory_1h, avg_disk_1h, total_metrics_count, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1, NOW())
       ON CONFLICT (service_id)
       DO UPDATE SET
         latest_cpu = EXCLUDED.latest_cpu,
         latest_memory = EXCLUDED.latest_memory,
         latest_disk = EXCLUDED.latest_disk,
         latest_load_avg = EXCLUDED.latest_load_avg,
         avg_cpu_1h = EXCLUDED.avg_cpu_1h,
         avg_memory_1h = EXCLUDED.avg_memory_1h,
         avg_disk_1h = EXCLUDED.avg_disk_1h,
         status = EXCLUDED.status,
         last_heartbeat = EXCLUDED.last_heartbeat,
         total_metrics_count = services_status_view.total_metrics_count + 1,
         updated_at = NOW()`,
      [
        data.service_id,
        data.service_name,
        data.service_hostname,
        data.service_os,
        data.service_version,
        status,
        data.service_last_heartbeat || new Date(),
        data.cpu_usage,
        data.memory_usage,
        data.disk_usage,
        data.load_avg,
        parseFloat(avgResult.rows[0].avg_cpu).toFixed(2),
        parseFloat(avgResult.rows[0].avg_memory).toFixed(2),
        parseFloat(avgResult.rows[0].avg_disk).toFixed(2)
      ]
    );
    // 4. Check for alerts (simple thresholds)
    if (data.cpu_usage > 90 || data.memory_usage > 90 || (data.disk_usage && data.disk_usage > 90)) {
      let alertType = '';
      let currentValue = 0;
      let threshold = 90;
      
      if (data.cpu_usage > 90) {
        alertType = 'cpu_high';
        currentValue = data.cpu_usage;
      } else if (data.memory_usage > 90) {
        alertType = 'memory_high';
        currentValue = data.memory_usage;
      } else {
        alertType = 'disk_full';
        currentValue = data.disk_usage;
      }

      await readClient.query(
        `INSERT INTO alert_triggers_view 
         (service_id, service_name, alert_type, severity, current_value, threshold_value, message, triggered_at)
         VALUES ($1, $2, $3, 'critical', $4, $5, $6, $7)`,
        [
          data.service_id,
          data.service_name,
          alertType,
          currentValue,
          threshold,
          `${alertType.replace('_', ' ').toUpperCase()}: ${currentValue.toFixed(1)}% (threshold: ${threshold}%)`,
          data.created_at
        ]
      );
    }

    await readClient.query("COMMIT");
  } catch (err) {
    await readClient.query("ROLLBACK");
    throw err;
  } finally {
    readClient.release();
  }
}

async function handleProcessMetricRecorded(event) {
  const data = event.payload;

  try {
    await readDB.query(
      `INSERT INTO process_metrics_view 
       (service_id, service_name, process_name, pid, cpu_usage, memory_usage, timestamp, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        data.service_id,
        data.service_name,
        data.process_name,
        data.pid,
        data.cpu_usage,
        data.memory_usage,
        data.created_at
      ]
    );

    const countResult = await readDB.query(
      'SELECT COUNT(DISTINCT process_name) as count FROM process_metrics_view WHERE service_id = $1',
      [data.service_id]
    );

    await readDB.query(
      'UPDATE services_status_view SET total_processes = $1 WHERE service_id = $2',
      [countResult.rows[0].count, data.service_id]
    );
  } catch (err) {
    throw err;
  }
}

async function handleServiceCreated(event) {
  const data = event.payload;

  try {
    await readDB.query(
      `INSERT INTO services_status_view 
       (service_id, name, hostname, os, version, status, last_heartbeat, total_metrics_count)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, 0)
       ON CONFLICT (service_id) DO NOTHING`,
      [data.id, data.name, data.hostname, data.os, data.version, data.last_heartbeat || new Date()]
    );
  } catch (err) {
    throw err;
  }
}

async function handleServiceHeartbeat(event) {
  const data = event.payload;

  try {
    await readDB.query(
      `UPDATE services_status_view 
       SET last_heartbeat = $1, status = 'active', updated_at = NOW()
       WHERE service_id = $2`,
      [data.last_heartbeat, data.service_id]
    );
  } catch (err) {
    throw err;
  }
}

async function processEvent(event, retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  try {
    switch (event.event_type) {
      case "system_metric_recorded":
        await handleSystemMetricRecorded(event);
        break;
      case "process_metric_recorded":
        await handleProcessMetricRecorded(event);
        break;
      case "service_created":
        await handleServiceCreated(event);
        break;
      case "service_heartbeat":
        await handleServiceHeartbeat(event);
        break;
      default:
        console.warn(` Unknown event type: ${event.event_type}`);
    }

    await writeDB.query(
      "UPDATE events SET processed = true, processed_at = NOW() WHERE id = $1",
      [event.id]
    );

    metrics.eventsProcessed++;
    return true;
  } catch (err) {
    console.error(
      `Error processing event ${event.id} (${event.event_type}):`,
      err.message
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return processEvent(event, retryCount + 1);
    } else {
      metrics.eventsErrored++;
      console.error(`Event ${event.id} failed after ${MAX_RETRIES} retries`);
      
      await writeDB.query(
        "UPDATE events SET processed = true, processed_at = NOW() WHERE id = $1",
        [event.id]
      );
      return false;
    }
  }
}

async function processPendingEvents() {
  const startTime = Date.now();

  try {
    const { rows: events } = await writeDB.query(
      `SELECT * FROM events 
       WHERE processed = false 
       ORDER BY created_at ASC 
       LIMIT 100`
    );

    if (events.length === 0) {
      return;
    }

    console.log(`Processing ${events.length} events...`);

    let successCount = 0;
    for (const event of events) {
      const success = await processEvent(event);
      if (success) successCount++;
    }

    const processingTime = Date.now() - startTime;
    recordProcessingTime(processingTime);

    const { rows: lagData } = await writeDB.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) as lag_seconds
       FROM events WHERE processed = false`
    );
    const lagSeconds = lagData[0]?.lag_seconds || 0;

    const { rows: backlogData } = await writeDB.query(
      "SELECT COUNT(*) as count FROM events WHERE processed = false"
    );
    metrics.currentBacklog = parseInt(backlogData[0].count);

    await saveReplicationMetrics(lagSeconds);

    console.log(
      `Processed ${successCount}/${events.length} events in ${processingTime}ms | ` +
      `Backlog: ${metrics.currentBacklog} | Lag: ${lagSeconds.toFixed(2)}s | ` +
      `Avg: ${getAverageProcessingTime()}ms`
    );

    metrics.lastProcessedAt = new Date();
    metrics.batchesProcessed++;

    // If there are more events, process them immediately
    if (metrics.currentBacklog > 0) {
      setImmediate(processPendingEvents);
    }
  } catch (err) {
    console.error("Sync error:", err.message);
  }
}


let listenClient = null;
let isProcessing = false;

async function setupEventListener() {
  try {
    listenClient = await writeDB.connect();
    
    listenClient.on('notification', async (msg) => {
      metrics.notificationsReceived++;
      
      // Debounce: Don't trigger if already processing
      if (isProcessing) {
        return;
      }
      
      isProcessing = true;
      await processPendingEvents();
      isProcessing = false;
    });

    listenClient.on('error', (err) => {
      console.error('LISTEN client error:', err.message);
      setupEventListener(); // Reconnect
    });

    await listenClient.query('LISTEN events_channel');
    console.log('Listening for event notifications on "events_channel"');
    
    // Also process any existing backlog on startup
    await processPendingEvents();
  } catch (err) {
    console.error('Failed to setup event listener:', err.message);
    setTimeout(setupEventListener, 5000);
  }
}


async function printStatus() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 EVENT-DRIVEN REPLICATION STATUS");
  console.log("=".repeat(70));
  console.log(`Total processed: ${metrics.eventsProcessed}`);
  console.log(`Total errors: ${metrics.eventsErrored}`);
  console.log(`Notifications received: ${metrics.notificationsReceived}`);
  console.log(`Batches processed: ${metrics.batchesProcessed}`);
  console.log(`Current backlog: ${metrics.currentBacklog}`);
  console.log(`Avg processing time: ${getAverageProcessingTime()}ms`);
  console.log(
    `Last processed: ${metrics.lastProcessedAt ? metrics.lastProcessedAt.toISOString() : "Never"}`
  );
  console.log("=".repeat(70) + "\n");
}

let isShuttingDown = false;

async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("\n Shutting down gracefully...");
  
  if (listenClient) {
    await listenClient.query('UNLISTEN events_channel');
    listenClient.release();
  }
  
  await writeDB.end();
  await readDB.end();
  
  console.log("All connections closed. Goodbye!");
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function start() {
  console.log("Starting PioneerPulse Event-Driven Replication Service...");
  console.log("Mode: PostgreSQL NOTIFY/LISTEN (TRUE Event-Driven)\n");
  
  try {
    await writeDB.query("SELECT NOW()");
    await readDB.query("SELECT NOW()");
    console.log("Database connections established");
  } catch (err) {
    console.error("Failed to connect to databases:", err.message);
    process.exit(1);
  }

  // Setup event listener
  await setupEventListener();

  // Status reporting every 10 seconds
  setInterval(printStatus, 10000);
}

start();