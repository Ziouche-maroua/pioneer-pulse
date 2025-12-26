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

async function handleMetricRecorded(event) {
  const data = event.payload;
  const readClient = await readDB.connect();

  try {
    await readClient.query("BEGIN");

    // Update dashboard_metrics_view (latest value per service+metric)
    await readClient.query(
      `INSERT INTO dashboard_metrics_view 
       (service_id, service_name, metric_type, latest_value, latest_timestamp, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (service_id, metric_type) 
       DO UPDATE SET 
         latest_value = EXCLUDED.latest_value,
         latest_timestamp = EXCLUDED.latest_timestamp,
         trend = CASE 
           WHEN EXCLUDED.latest_value > dashboard_metrics_view.latest_value THEN 'up'
           WHEN EXCLUDED.latest_value < dashboard_metrics_view.latest_value THEN 'down'
           ELSE 'stable'
         END,
         updated_at = NOW()`,
      [
        data.service_id,
        data.service_name,
        data.metric_type,
        data.value,
        data.recorded_at,
      ]
    );

    // Update hourly aggregation
    const hourTimestamp = new Date(data.recorded_at);
    hourTimestamp.setMinutes(0, 0, 0); // Round to hour

    await readClient.query(
      `INSERT INTO metrics_hourly_agg 
       (service_id, metric_type, hour_timestamp, avg_value, min_value, max_value, sample_count)
       VALUES ($1, $2, $3, $4, $4, $4, 1)
       ON CONFLICT (service_id, metric_type, hour_timestamp)
       DO UPDATE SET
         avg_value = (
           (metrics_hourly_agg.avg_value * metrics_hourly_agg.sample_count + EXCLUDED.avg_value) 
           / (metrics_hourly_agg.sample_count + 1)
         ),
         min_value = LEAST(metrics_hourly_agg.min_value, EXCLUDED.min_value),
         max_value = GREATEST(metrics_hourly_agg.max_value, EXCLUDED.max_value),
       (service_id, metric_type, hour_timestamp, avg_value, min_value, max_value, sample_count)
       VALUES ($1, $2, $3, $4, $4, $4, 1)
       ON CONFLICT (service_id, metric_type, hour_timestamp)
       DO UPDATE SET
         avg_value = (
           (metrics_hourly_agg.avg_value * metrics_hourly_agg.sample_count + EXCLUDED.avg_value) 
           / (metrics_hourly_agg.sample_count + 1)
         ),
         min_value = LEAST(metrics_hourly_agg.min_value, EXCLUDED.min_value),
         max_value = GREATEST(metrics_hourly_agg.max_value, EXCLUDED.max_value),
         sample_count = metrics_hourly_agg.sample_count + 1`,
      [data.service_id, data.metric_type, hourTimestamp, data.value]
    );

    // Update services_status_view
    await readClient.query(
      `INSERT INTO services_status_view 
       (service_id, name, hostname, ip_address, status, last_metric_time, total_metrics_count)
       VALUES ($1, $2, $3, $4, 'active', $5, 1)
       ON CONFLICT (service_id)
       DO UPDATE SET
         last_metric_time = EXCLUDED.last_metric_time,
         total_metrics_count = services_status_view.total_metrics_count + 1,
         updated_at = NOW()`,
      [
        data.service_id,
        data.service_name,
        data.hostname || "unknown",
        data.ip_address || null,
        data.recorded_at,
      ]
    );

    // Calculate and update 1-hour averages for services_status_view
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await readClient.query(
      `UPDATE services_status_view 
       SET 
         avg_cpu_1h = (
           SELECT COALESCE(AVG(latest_value), 0) 
           FROM dashboard_metrics_view 
           WHERE service_id = $1 
             AND metric_type = 'cpu'
             AND latest_timestamp > $2
         ),
         avg_memory_1h = (
           SELECT COALESCE(AVG(latest_value), 0) 
           FROM dashboard_metrics_view 
           WHERE service_id = $1 
             AND metric_type = 'memory'
             AND latest_timestamp > $2
         )
       WHERE service_id = $1`,
      [data.service_id, oneHourAgo]
    );

    await readClient.query("COMMIT");
  } catch (err) {
    await readClient.query("ROLLBACK");
    throw err;
  } finally {
    readClient.release();
  }
}

async function handleServiceCreated(event) {
  const data = event.payload;

  await readDB.query(
    `INSERT INTO services_status_view 
     (service_id, name, hostname, ip_address, status, total_metrics_count)
     VALUES ($1, $2, $3, $4, $5, 0)
     ON CONFLICT (service_id) DO NOTHING`,
    [data.id, data.name, data.hostname, data.ip_address, data.status || "active"]
  );
}

async function processEvent(event, retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  try {
    switch (event.event_type) {
      case "metric_recorded":
        await handleMetricRecorded(event);
        break;
      case "service_created":
        await handleServiceCreated(event);
        break;
      default:
        console.warn(`⚠️  Unknown event type: ${event.event_type}`);
    }

    // Mark as processed
    await writeDB.query(
      "UPDATE events SET processed = true, processed_at = NOW() WHERE id = $1",
      [event.id]
    );

    metrics.eventsProcessed++;
    return true;
  } catch (err) {
    console.error(
      ` Error processing event ${event.id} (${event.event_type}):`,
      err.message
    );

    if (retryCount < MAX_RETRIES) {
      console.log(` Retrying in ${RETRY_DELAY_MS}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return processEvent(event, retryCount + 1);
    } else {
      metrics.eventsErrored++;
      console.error(` Event ${event.id} failed after ${MAX_RETRIES} retries`);
      
      // Mark as processed to avoid infinite retry (log for manual review)
      await writeDB.query(
        "UPDATE events SET processed = true, processed_at = NOW() WHERE id = $1",
        [event.id]
      );
      return false;
    }
  }
}
// MAIN SYNC LOOP (EVENT-DRIVEN)

async function syncEvents() {
  const startTime = Date.now();

  try {
    // Fetch unprocessed events (batch of 100)
    const { rows: events } = await writeDB.query(
      `SELECT * FROM events 
       WHERE processed = false 
       ORDER BY created_at ASC 
       LIMIT 100`
    );

    if (events.length === 0) {
      console.log(" No pending events");
      metrics.currentBacklog = 0;
      return;
    }

    console.log(` Processing ${events.length} events...`);

    // Process each event
    let successCount = 0;
    for (const event of events) {
      const success = await processEvent(event);
      if (success) successCount++;
    }

    // Calculate metrics
    const processingTime = Date.now() - startTime;
    recordProcessingTime(processingTime);

    // Calculate replication lag
    const { rows: lagData } = await writeDB.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) as lag_seconds
       FROM events WHERE processed = false`
    );
    const lagSeconds = lagData[0]?.lag_seconds || 0;

    // Get backlog size
    const { rows: backlogData } = await writeDB.query(
      "SELECT COUNT(*) as count FROM events WHERE processed = false"
    );
    metrics.currentBacklog = parseInt(backlogData[0].count);

    // Save metrics to read DB
    await saveReplicationMetrics(lagSeconds);

    //   Log summary
    console.log(
      ` Processed ${successCount}/${events.length} events in ${processingTime}ms | ` +
      `Backlog: ${metrics.currentBacklog} | Lag: ${lagSeconds.toFixed(2)}s | ` +
      `Avg time: ${getAverageProcessingTime()}ms`
    );

    metrics.lastProcessedAt = new Date();
  } catch (err) {
    console.error(" Sync error:", err.message);
  }
}

async function printStatus() {
  console.log("\n" + "=".repeat(70));
  console.log("REPLICATION STATUS");
  console.log("=".repeat(70));
  console.log(`Total processed: ${metrics.eventsProcessed}`);
  console.log(`Total errors: ${metrics.eventsErrored}`);
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
  
  await writeDB.end();
  await readDB.end();
  
  console.log(" All connections closed. Goodbye!");
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// START REPLICATION SERVICE

async function start() {
  console.log(" Starting PioneerPulse Replication Service...");
  
  // Test connections
  try {
    await writeDB.query("SELECT NOW()");
    await readDB.query("SELECT NOW()");
    console.log(" Database connections established");
  } catch (err) {
    console.error("Failed to connect to databases:", err.message);
    process.exit(1);
  }

  // Run sync every 1 second (configurable)
  const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS) || 1000;
  console.log(`  Sync interval: ${SYNC_INTERVAL_MS}ms\n`);

  setInterval(syncEvents, SYNC_INTERVAL_MS);
  setInterval(printStatus, 10000); // Status every 10 seconds

  // Run immediately
  syncEvents();
}

start();