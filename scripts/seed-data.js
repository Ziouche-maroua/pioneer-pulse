require("dotenv").config();
const { Pool } = require("pg");

const writeDB = new Pool({
  host: process.env.WRITE_DB_HOST || "localhost",
  port: process.env.WRITE_DB_PORT || 5433,
  user: process.env.WRITE_DB_USER || "writeuser",
  password: process.env.WRITE_DB_PASSWORD || "writepass",
  database: process.env.WRITE_DB_NAME || "pioneerpulse_write",
});

const SERVICES = [
  { name: "web-api", hostname: "web-01.local", ip: "192.168.1.10" },
  { name: "auth-service", hostname: "auth-01.local", ip: "192.168.1.11" },
  { name: "database", hostname: "db-01.local", ip: "192.168.1.20" },
  { name: "cache-redis", hostname: "cache-01.local", ip: "192.168.1.30" },
  { name: "queue-worker", hostname: "worker-01.local", ip: "192.168.1.40" },
];

const METRIC_TYPES = ["cpu", "memory", "disk", "network"];
const METRICS_PER_SERVICE = 100;
const TIME_SPAN_HOURS = 24;

function randomValue(metricType) {
  switch (metricType) {
    case "cpu":
      return (Math.random() * 100).toFixed(2);
    case "memory":
      return (Math.random() * 16384).toFixed(2);
    case "disk":
      return (Math.random() * 100).toFixed(2);
    case "network":
      return (Math.random() * 1000).toFixed(2);
    default:
      return (Math.random() * 100).toFixed(2);
  }
}

function randomTimestamp() {
  const now = Date.now();
  const timeSpanMs = TIME_SPAN_HOURS * 60 * 60 * 1000;
  const randomOffset = Math.random() * timeSpanMs;
  return new Date(now - randomOffset);
}

async function emitEvent(client, eventType, aggregateType, aggregateId, payload) {
  await client.query(
    `INSERT INTO events (event_type, aggregate_type, aggregate_id, payload, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [eventType, aggregateType, aggregateId, JSON.stringify(payload)]
  );
}

async function seedServices() {
  const client = await writeDB.connect();

  try {
    for (const service of SERVICES) {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO services (name, hostname, ip_address, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (name) DO NOTHING
         RETURNING id, name, hostname, ip_address, status, created_at`,
        [service.name, service.hostname, service.ip]
      );

      if (result.rows.length > 0) {
        const insertedService = result.rows[0];

        await emitEvent(
          client,
          "service_created",
          "service",
          insertedService.id,
          {
            id: insertedService.id,
            name: insertedService.name,
            hostname: insertedService.hostname,
            ip_address: insertedService.ip_address,
            status: insertedService.status,
            created_at: insertedService.created_at,
          }
        );
      }

      await client.query("COMMIT");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function seedMetrics() {
  const { rows: services } = await writeDB.query(
    "SELECT id, name, hostname, ip_address FROM services"
  );

  let totalInserted = 0;
  const batchSize = 50;

  for (const service of services) {
    for (let i = 0; i < METRICS_PER_SERVICE; i += batchSize) {
      const client = await writeDB.connect();

      try {
        await client.query("BEGIN");

        const batch = Math.min(batchSize, METRICS_PER_SERVICE - i);

        for (let j = 0; j < batch; j++) {
          const metricType =
            METRIC_TYPES[Math.floor(Math.random() * METRIC_TYPES.length)];
          const value = randomValue(metricType);
          const recordedAt = randomTimestamp();

          const result = await client.query(
            `INSERT INTO metrics (service_id, metric_type, value, recorded_at, metadata)
             VALUES ($1, $2, $3, $4, '{}')
             RETURNING id, service_id, metric_type, value, recorded_at`,
            [service.id, metricType, value, recordedAt]
          );

          const metric = result.rows[0];

          await emitEvent(
            client,
            "metric_recorded",
            "metric",
            metric.id,
            {
              id: metric.id,
              service_id: metric.service_id,
              service_name: service.name,
              hostname: service.hostname,
              ip_address: service.ip_address,
              metric_type: metric.metric_type,
              value: parseFloat(metric.value),
              recorded_at: metric.recorded_at,
            }
          );

          totalInserted++;
        }

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
      } finally {
        client.release();
      }
    }
  }
}

async function printStats() {
  const { rows: serviceStats } = await writeDB.query(
    "SELECT COUNT(*) as count FROM services"
  );
  const { rows: metricStats } = await writeDB.query(
    "SELECT COUNT(*) as count FROM metrics"
  );
  const { rows: eventStats } = await writeDB.query(
    "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE processed = false) as pending FROM events"
  );
  const { rows: timeRange } = await writeDB.query(
    "SELECT MIN(recorded_at) as oldest, MAX(recorded_at) as newest FROM metrics"
  );

  console.log({
    services: serviceStats[0].count,
    metrics: metricStats[0].count,
    events: eventStats[0],
    timeRange: timeRange[0],
  });
}

async function generateRealtimeMetrics(durationSeconds = 60, ratePerSecond = 10) {
  const { rows: services } = await writeDB.query(
    "SELECT id, name, hostname, ip_address FROM services"
  );

  const intervalMs = 1000 / ratePerSecond;
  let count = 0;
  const maxCount = durationSeconds * ratePerSecond;

  const interval = setInterval(async () => {
    if (count >= maxCount) {
      clearInterval(interval);
      await writeDB.end();
      process.exit(0);
      return;
    }

    const service = services[Math.floor(Math.random() * services.length)];
    const metricType =
      METRIC_TYPES[Math.floor(Math.random() * METRIC_TYPES.length)];
    const value = randomValue(metricType);

    const client = await writeDB.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO metrics (service_id, metric_type, value, recorded_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, service_id, metric_type, value, recorded_at`,
        [service.id, metricType, value]
      );

      const metric = result.rows[0];

      await emitEvent(
        client,
        "metric_recorded",
        "metric",
        metric.id,
        {
          id: metric.id,
          service_id: metric.service_id,
          service_name: service.name,
          hostname: service.hostname,
          ip_address: service.ip_address,
          metric_type: metric.metric_type,
          value: parseFloat(metric.value),
          recorded_at: metric.recorded_at,
        }
      );

      await client.query("COMMIT");
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }, intervalMs);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "seed";

  try {
    if (mode === "seed") {
      await seedServices();
      await seedMetrics();
      await printStats();
    } else if (mode === "live") {
      const duration = parseInt(args[1]) || 60;
      const rate = parseInt(args[2]) || 10;
      await generateRealtimeMetrics(duration, rate);
    } else if (mode === "clean") {
      await writeDB.query(
        "TRUNCATE events, metrics, services RESTART IDENTITY CASCADE"
      );
    }

    await writeDB.end();
    process.exit(0);
  } catch (err) {
    await writeDB.end();
    process.exit(1);
  }
}

main();
