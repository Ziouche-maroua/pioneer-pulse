require("dotenv").config();
const { Pool } = require("pg");

const writeDB = new Pool({
  host: process.env.WRITE_DB_HOST || "localhost",
  port: process.env.WRITE_DB_PORT || 5433,
  user: process.env.WRITE_DB_USER || "writeuser",
  password: process.env.WRITE_DB_PASSWORD || "writepass",
  database: process.env.WRITE_DB_NAME || "pioneerpulse_write",
});

const readDB = new Pool({
  host: process.env.READ_DB_HOST || "localhost",
  port: process.env.READ_DB_PORT || 5434,
  user: process.env.READ_DB_USER || "readuser",
  password: process.env.READ_DB_PASSWORD || "readpass",
  database: process.env.READ_DB_NAME || "pioneerpulse_read",
});

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getHealthColor(value, thresholds) {
  if (value < thresholds.good) return "green";
  if (value < thresholds.warning) return "yellow";
  return "red";
}

async function getWriteDBStats() {
  try {
    const stats = {};
    const { rows: metricCount } = await writeDB.query("SELECT COUNT(*) as count FROM metrics");
    stats.totalMetrics = parseInt(metricCount[0].count);
    const { rows: eventCount } = await writeDB.query(
      "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE processed = false) as pending FROM events"
    );
    stats.totalEvents = parseInt(eventCount[0].total);
    stats.pendingEvents = parseInt(eventCount[0].pending);
    const { rows: lagData } = await writeDB.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) as lag_seconds
       FROM events WHERE processed = false`
    );
    stats.lagSeconds = parseFloat(lagData[0]?.lag_seconds || 0);
    const { rows: recentEvents } = await writeDB.query(
      "SELECT COUNT(*) as count FROM events WHERE created_at > NOW() - INTERVAL '1 minute'"
    );
    stats.eventsLastMinute = parseInt(recentEvents[0].count);
    const { rows: serviceCount } = await writeDB.query("SELECT COUNT(*) as count FROM services");
    stats.totalServices = parseInt(serviceCount[0].count);
    return stats;
  } catch (err) {
    console.error("Error getting write DB stats:", err.message);
    return null;
  }
}

async function getReadDBStats() {
  try {
    const stats = {};
    const { rows: dashboardCount } = await readDB.query(
      "SELECT COUNT(*) as count FROM dashboard_metrics_view"
    );
    stats.dashboardMetrics = parseInt(dashboardCount[0].count);
    const { rows: hourlyCount } = await readDB.query(
      "SELECT COUNT(*) as count FROM metrics_hourly_agg"
    );
    stats.hourlyAggregations = parseInt(hourlyCount[0].count);
    const { rows: serviceCount } = await readDB.query(
      "SELECT COUNT(*) as count FROM services_status_view"
    );
    stats.servicesInView = parseInt(serviceCount[0].count);
    const { rows: replicationData } = await readDB.query(
      `SELECT events_processed, events_pending, lag_seconds, processing_time_ms, measured_at
       FROM replication_metrics
       ORDER BY measured_at DESC
       LIMIT 1`
    );
    stats.lastReplicationCheck = replicationData.length > 0 ? replicationData[0] : null;
    const { rows: avgProcessing } = await readDB.query(
      `SELECT AVG(processing_time_ms) as avg_ms
       FROM (SELECT processing_time_ms FROM replication_metrics ORDER BY measured_at DESC LIMIT 10) sub`
    );
    stats.avgProcessingTimeMs = parseFloat(avgProcessing[0]?.avg_ms || 0);
    return stats;
  } catch (err) {
    console.error("Error getting read DB stats:", err.message);
    return null;
  }
}

function clearScreen() {
  console.clear();
  console.log("\x1b[2J\x1b[H");
}

function displayHeader() {
  console.log(colorize("═".repeat(80), "cyan"));
  console.log(colorize("  PIONEERPULSE REPLICATION MONITOR", "bright"));
  console.log(colorize("  Real-time CQRS Health Dashboard", "cyan"));
  console.log(colorize("═".repeat(80), "cyan"));
  console.log();
}

function displayWriteDBSection(stats) {
  console.log(colorize("┌─ WRITE DATABASE (Command Side)", "blue"));
  console.log(colorize("│", "blue"));
  console.log(colorize("│", "blue") + `  Services:       ${colorize(stats.totalServices.toLocaleString(), "bright")}`);
  console.log(colorize("│", "blue") + `  Total Metrics:  ${colorize(stats.totalMetrics.toLocaleString(), "bright")}`);
  console.log(colorize("│", "blue") + `  Total Events:   ${colorize(stats.totalEvents.toLocaleString(), "bright")}`);
  const pendingColor = getHealthColor(stats.pendingEvents, { good: 100, warning: 500 });
  console.log(colorize("│", "blue") + `  Pending Events: ${colorize(stats.pendingEvents.toLocaleString(), pendingColor)}`);
  const lagColor = getHealthColor(stats.lagSeconds, { good: 1, warning: 5 });
  console.log(colorize("│", "blue") + `  Repl. Lag:      ${colorize(stats.lagSeconds.toFixed(2) + "s", lagColor)}`);
  console.log(colorize("│", "blue") + `  Events/min:     ${colorize(stats.eventsLastMinute.toLocaleString(), "bright")}`);
  console.log(colorize("└" + "─".repeat(78), "blue"));
  console.log();
}

function displayReadDBSection(stats) {
  console.log(colorize("┌─ READ DATABASE (Query Side)", "green"));
  console.log(colorize("│", "green"));
  console.log(colorize("│", "green") + `  Services View:       ${colorize(stats.servicesInView.toLocaleString(), "bright")}`);
  console.log(colorize("│", "green") + `  Dashboard Metrics:   ${colorize(stats.dashboardMetrics.toLocaleString(), "bright")}`);
  console.log(colorize("│", "green") + `  Hourly Aggregations: ${colorize(stats.hourlyAggregations.toLocaleString(), "bright")}`);
  if (stats.lastReplicationCheck) {
    const check = stats.lastReplicationCheck;
    const timeSince = Math.floor((Date.now() - new Date(check.measured_at).getTime()) / 1000);
    console.log(colorize("│", "green") + `  Last Check: ${colorize(timeSince + "s ago", "cyan")}`);
    console.log(colorize("│", "green") + `    └─ Processed: ${colorize(check.events_processed.toLocaleString(), "bright")}`);
    console.log(colorize("│", "green") + `    └─ Pending:   ${colorize(check.events_pending.toLocaleString(), "yellow")}`);
    console.log(colorize("│", "green") + `    └─ Lag:       ${colorize(parseFloat(check.lag_seconds).toFixed(2) + "s", "cyan")}`);
  }
  const avgColor = getHealthColor(stats.avgProcessingTimeMs, { good: 50, warning: 200 });
  console.log(colorize("│", "green") + `  Avg Processing:      ${colorize(stats.avgProcessingTimeMs.toFixed(2) + "ms", avgColor)}`);
  console.log(colorize("└" + "─".repeat(78), "green"));
  console.log();
}

function displayHealthSummary(writeStats, readStats) {
  console.log(colorize("┌─ SYSTEM HEALTH", "yellow"));
  console.log(colorize("│", "yellow"));
  let health = "HEALTHY";
  let healthColor = "green";
  if (writeStats.lagSeconds > 5 || writeStats.pendingEvents > 500) {
    health = "DEGRADED";
    healthColor = "yellow";
  }
  if (writeStats.lagSeconds > 30 || writeStats.pendingEvents > 2000) {
    health = "CRITICAL";
    healthColor = "red";
  }
  console.log(colorize("│", "yellow") + `  Status: ${colorize(health, healthColor)}`);
  const syncPercentage = ((writeStats.totalMetrics / Math.max(readStats.dashboardMetrics, 1)) * 100).toFixed(1);
  console.log(colorize("│", "yellow") + `  Sync Coverage: ${colorize(syncPercentage + "%", "cyan")}`);
  const throughput = writeStats.eventsLastMinute;
  console.log(colorize("│", "yellow") + `  Throughput: ${colorize(throughput + " events/min", "cyan")}`);
  console.log(colorize("└" + "─".repeat(78), "yellow"));
  console.log();
}

function displayFooter() {
  console.log(colorize("─".repeat(80), "cyan"));
  console.log(colorize("  Press Ctrl+C to exit", "cyan") + colorize(" | ", "cyan") + colorize(`Updated: ${new Date().toLocaleTimeString()}`, "cyan"));
  console.log(colorize("─".repeat(80), "cyan"));
}

async function refresh() {
  clearScreen();
  displayHeader();
  const writeStats = await getWriteDBStats();
  const readStats = await getReadDBStats();
  if (writeStats && readStats) {
    displayWriteDBSection(writeStats);
    displayReadDBSection(readStats);
    displayHealthSummary(writeStats, readStats);
  } else {
    console.log(colorize("Error: Could not fetch statistics", "red"));
  }
  displayFooter();
}

async function start() {
  try {
    await writeDB.query("SELECT 1");
    await readDB.query("SELECT 1");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  await refresh();
  setInterval(refresh, 2000);
}

process.on("SIGINT", async () => {
  await writeDB.end();
  await readDB.end();
  process.exit(0);
});

start();
