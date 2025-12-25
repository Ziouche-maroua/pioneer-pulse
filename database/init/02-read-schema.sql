CREATE TABLE IF NOT EXISTS service_metrics_summary (
    service_name TEXT PRIMARY KEY,
    avg_cpu REAL NOT NULL,
    avg_memory REAL NOT NULL,
    last_updated TIMESTAMP NOT NULL
);