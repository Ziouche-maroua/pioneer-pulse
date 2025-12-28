// scripts/seed-data.js
// Generate realistic monitoring data for PioneerPulse

require("dotenv").config();
const { Pool } = require("pg");
const crypto = require("crypto");

const writeDB = new Pool({
  host: process.env.WRITE_DB_HOST || "localhost",
  port: process.env.WRITE_DB_PORT || 5433,
  user: process.env.WRITE_DB_USER || "writeuser",
  password: process.env.WRITE_DB_PASSWORD || "writepass",
  database: process.env.WRITE_DB_NAME || "pioneerpulse_write",
});

const SERVICES = [
  { name: "web-server-01", hostname: "web01.local", os: "Ubuntu 22.04", version: "nginx/1.18" },
  { name: "api-server-01", hostname: "api01.local", os: "Ubuntu 22.04", version: "node/18.16" },
  { name: "database-primary", hostname: "db01.local", os: "Ubuntu 22.04", version: "postgresql/15" },
  { name: "cache-redis-01", hostname: "redis01.local", os: "Ubuntu 22.04", version: "redis/7.0" },
  { name: "worker-queue-01", hostname: "worker01.local", os: "Ubuntu 22.04", version: "python/3.11" },
];

const SYSTEM_METRICS_PER_SERVICE = 100;
const PROCESS_METRICS_PER_SERVICE = 50;
const TIME_SPAN_HOURS = 24;

function randomCPU() {
  return (Math.random() * 100).toFixed(2);
}

function randomMemory() {
  return (Math.random() * 100).toFixed(2);
}

function randomDisk() {
  return (Math.random() * 100).toFixed(2);
}

function randomLoadAvg() {
  return (Math.random() * 4).toFixed(2);
}

function randomNetworkBytes() {
  return Math.floor(Math.random() * 1000000000);
}

function randomGPU() {
  return Math.random() > 0.5 ? null : (Math.random() * 100).toFixed(2);
}

function randomTimestamp() {
  const now = Date.now();
  const timeSpanMs = TIME_SPAN_HOURS * 60 * 60 * 1000;
  const randomOffset = Math.random() * timeSpanMs;
  return new Date(now - randomOffset);
}

const PROCESS_NAMES = [
  "nginx", "node", "postgres", "redis-server", "python3",
  "docker", "systemd", "sshd", "cron", "rsyslog"
];

function randomProcessName() {
  return PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)];
}

function randomPID() {
  return Math.floor(Math.random() * 65535) + 1;
}

async function emitEvent(client, eventType, aggregateType, aggregateId, payload) {
  await client.query(
    `INSERT INTO events (event_type, aggregate_type, aggregate_id, payload, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [eventType, aggregateType, aggregateId, JSON.stringify(payload)]
  );
}

async function seedServices() {
  console.log("Seeding services...");
  
  const serviceIds = [];
  
  for (const service of SERVICES) {
    const client = await writeDB.connect();
    
    try {
      await client.query("BEGIN");

      const serviceId = crypto.randomUUID();
      
      const result = await client.query(
        `INSERT INTO services (id, name, hostname, os, version, last_heartbeat, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [serviceId, service.name, service.hostname, service.os, service.version]
      );

      const insertedService = result.rows[0];
      serviceIds.push({
        id: insertedService.id,
        name: insertedService.name,
        hostname: insertedService.hostname,
        os: insertedService.os,
        version: insertedService.version,
        last_heartbeat: insertedService.last_heartbeat
      });

      await emitEvent(
        client,
        "service_created",
        "service",
        insertedService.id,
        {
          id: insertedService.id,
          name: insertedService.name,
          hostname: insertedService.hostname,
          os: insertedService.os,
          version: insertedService.version,
          last_heartbeat: insertedService.last_heartbeat,
          created_at: insertedService.created_at
        }
      );

      await client.query("COMMIT");
      
      console.log(`  Created service: ${service.name} (ID: ${insertedService.id})`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  Error creating service ${service.name}:`, err.message);
    } finally {
      client.release();
    }
  }
  
  return serviceIds;
}

async function seedSystemMetrics(services) {
  console.log("\nSeeding system metrics...");
  
  let totalInserted = 0;
  const batchSize = 50;

  for (const service of services) {
    console.log(`  Generating ${SYSTEM_METRICS_PER_SERVICE} system metrics for ${service.name}...`);
    
    for (let i = 0; i < SYSTEM_METRICS_PER_SERVICE; i += batchSize) {
      const client = await writeDB.connect();
      
      try {
        await client.query("BEGIN");

        const batch = Math.min(batchSize, SYSTEM_METRICS_PER_SERVICE - i);
        
        for (let j = 0; j < batch; j++) {
          const createdAt = randomTimestamp();
          
          const result = await client.query(
            `INSERT INTO system_metrics 
             (service_id, cpu_usage, memory_usage, load_avg, disk_usage, 
              network_rx, network_tx, gpu_usage, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
              service.id,
              randomCPU(),
              randomMemory(),
              randomLoadAvg(),
              randomDisk(),
              randomNetworkBytes(),
              randomNetworkBytes(),
              randomGPU(),
              createdAt
            ]
          );

          const metric = result.rows[0];

          await emitEvent(
            client,
            "system_metric_recorded",
            "system_metric",
            metric.id,
            {
              id: metric.id,
              service_id: service.id,
              service_name: service.name,
              service_hostname: service.hostname,
              service_os: service.os,
              service_version: service.version,
              service_last_heartbeat: service.last_heartbeat,
              cpu_usage: parseFloat(metric.cpu_usage),
              memory_usage: parseFloat(metric.memory_usage),
              load_avg: parseFloat(metric.load_avg),
              disk_usage: parseFloat(metric.disk_usage),
              network_rx: metric.network_rx,
              network_tx: metric.network_tx,
              gpu_usage: metric.gpu_usage ? parseFloat(metric.gpu_usage) : null,
              created_at: metric.created_at
            }
          );

          totalInserted++;
        }

        await client.query("COMMIT");
        
        process.stdout.write(
          `\r  Progress: ${totalInserted}/${services.length * SYSTEM_METRICS_PER_SERVICE} system metrics`
        );
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("\n  Error inserting system metrics batch:", err.message);
      } finally {
        client.release();
      }
    }
  }
  
  console.log(`\n  Inserted ${totalInserted} system metrics`);
}

async function seedProcessMetrics(services) {
  console.log("\nSeeding process metrics...");
  
  let totalInserted = 0;
  const batchSize = 50;

  for (const service of services) {
    console.log(`  Generating ${PROCESS_METRICS_PER_SERVICE} process metrics for ${service.name}...`);
    
    for (let i = 0; i < PROCESS_METRICS_PER_SERVICE; i += batchSize) {
      const client = await writeDB.connect();
      
      try {
        await client.query("BEGIN");

        const batch = Math.min(batchSize, PROCESS_METRICS_PER_SERVICE - i);
        
        for (let j = 0; j < batch; j++) {
          const createdAt = randomTimestamp();
          
          const result = await client.query(
            `INSERT INTO process_metrics 
             (service_id, process_name, pid, cpu_usage, memory_usage, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              service.id,
              randomProcessName(),
              randomPID(),
              randomCPU(),
              randomMemory(),
              createdAt
            ]
          );

          const metric = result.rows[0];

          await emitEvent(
            client,
            "process_metric_recorded",
            "process_metric",
            metric.id,
            {
              id: metric.id,
              service_id: service.id,
              service_name: service.name,
              process_name: metric.process_name,
              pid: metric.pid,
              cpu_usage: parseFloat(metric.cpu_usage),
              memory_usage: parseFloat(metric.memory_usage),
              created_at: metric.created_at
            }
          );

          totalInserted++;
        }

        await client.query("COMMIT");
        
        process.stdout.write(
          `\r  Progress: ${totalInserted}/${services.length * PROCESS_METRICS_PER_SERVICE} process metrics`
        );
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("\n  Error inserting process metrics batch:", err.message);
      } finally {
        client.release();
      }
    }
  }
  
  console.log(`\n  Inserted ${totalInserted} process metrics`);
}

async function printStats() {
  console.log("\nDatabase Statistics:");
  console.log("=".repeat(60));

  const { rows: serviceStats } = await writeDB.query("SELECT COUNT(*) as count FROM services");
  console.log(`Services: ${serviceStats[0].count}`);

  const { rows: systemMetricStats } = await writeDB.query("SELECT COUNT(*) as count FROM system_metrics");
  console.log(`System Metrics: ${systemMetricStats[0].count}`);

  const { rows: processMetricStats } = await writeDB.query("SELECT COUNT(*) as count FROM process_metrics");
  console.log(`Process Metrics: ${processMetricStats[0].count}`);

  const { rows: eventStats } = await writeDB.query(
    "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE processed = false) as pending FROM events"
  );
  console.log(`Events: ${eventStats[0].total} (${eventStats[0].pending} pending)`);

  const { rows: timeRange } = await writeDB.query(
    "SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM system_metrics"
  );
  
  if (timeRange[0].oldest) {
    console.log(
      `Time range: ${timeRange[0].oldest.toISOString()} to ${timeRange[0].newest.toISOString()}`
    );
  }

  console.log("=".repeat(60));
}

async function generateRealtimeMetrics(durationSeconds = 60, ratePerSecond = 10) {
  console.log(`\nLIVE: Generating ${ratePerSecond} metrics/sec for ${durationSeconds} seconds...`);
  
  const { rows: services } = await writeDB.query(
    "SELECT id, name, hostname, os, version, last_heartbeat FROM services"
  );
  
  if (services.length === 0) {
    console.error("No services found. Run seed first!");
    process.exit(1);
  }

  const intervalMs = 1000 / ratePerSecond;
  let count = 0;
  const maxCount = durationSeconds * ratePerSecond;

  const interval = setInterval(async () => {
    if (count >= maxCount) {
      clearInterval(interval);
      console.log(`\nLive generation complete (${count} metrics)`);
      await writeDB.end();
      process.exit(0);
      return;
    }

    const service = services[Math.floor(Math.random() * services.length)];
    const client = await writeDB.connect();
    
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO system_metrics 
         (service_id, cpu_usage, memory_usage, load_avg, disk_usage, 
          network_rx, network_tx, gpu_usage, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [
          service.id,
          randomCPU(),
          randomMemory(),
          randomLoadAvg(),
          randomDisk(),
          randomNetworkBytes(),
          randomNetworkBytes(),
          randomGPU()
        ]
      );

      const metric = result.rows[0];

      await emitEvent(
        client,
        "system_metric_recorded",
        "system_metric",
        metric.id,
        {
          id: metric.id,
          service_id: service.id,
          service_name: service.name,
          service_hostname: service.hostname,
          service_os: service.os,
          service_version: service.version,
          service_last_heartbeat: service.last_heartbeat,
          cpu_usage: parseFloat(metric.cpu_usage),
          memory_usage: parseFloat(metric.memory_usage),
          load_avg: parseFloat(metric.load_avg),
          disk_usage: parseFloat(metric.disk_usage),
          network_rx: metric.network_rx,
          network_tx: metric.network_tx,
          gpu_usage: metric.gpu_usage ? parseFloat(metric.gpu_usage) : null,
          created_at: metric.created_at
        }
      );

      await client.query("COMMIT");
      
      count++;
      process.stdout.write(`\rLIVE: ${count}/${maxCount} metrics generated`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("\nError:", err.message);
    } finally {
      client.release();
    }
  }, intervalMs);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "seed";

  try {
    console.log("PioneerPulse Data Seeder\n");

    if (mode === "seed") {
      const services = await seedServices();
      await seedSystemMetrics(services);
      await seedProcessMetrics(services);
      await printStats();
      
      console.log("\nTip: Run replication service to process events");
      console.log("Command: cd ../replication-service && node sync.js\n");
    } else if (mode === "live") {
      const duration = parseInt(args[1]) || 60;
      const rate = parseInt(args[2]) || 10;
      
      await generateRealtimeMetrics(duration, rate);
    } else if (mode === "clean") {
      console.log("Cleaning all data...");
      await writeDB.query(
        "TRUNCATE events, process_metrics, system_metrics, services RESTART IDENTITY CASCADE"
      );
      console.log("All data cleaned");
    } else {
      console.log("Usage:");
      console.log("  node seed-data.js seed");
      console.log("  node seed-data.js live [sec] [rate]");
      console.log("  node seed-data.js clean");
    }

    await writeDB.end();
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    await writeDB.end();
    process.exit(1);
  }
}

main();
