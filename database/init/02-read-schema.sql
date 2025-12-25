-- Services Status View (real-time dashboard)
CREATE TABLE IF NOT EXISTS services_status_view (
    service_id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    hostname VARCHAR(255),
    ip_address INET,
    status VARCHAR(50),
    last_metric_time TIMESTAMP,
    avg_cpu_1h DECIMAL(5,2),
    avg_memory_1h DECIMAL(5,2),
    total_metrics_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hourly Aggregations (time-series analytics)
CREATE TABLE IF NOT EXISTS metrics_hourly_agg (
    service_id INTEGER NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    hour_timestamp TIMESTAMP NOT NULL,
    avg_value DECIMAL(10,2) NOT NULL,
    min_value DECIMAL(10,2) NOT NULL,
    max_value DECIMAL(10,2) NOT NULL,
    sample_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (service_id, metric_type, hour_timestamp)
);

CREATE INDEX IF NOT EXISTS idx_hourly_service_time 
    ON metrics_hourly_agg(service_id, hour_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_hourly_type_time 
    ON metrics_hourly_agg(metric_type, hour_timestamp DESC);

-- Dashboard Metrics View (latest values per service per metric)
CREATE TABLE IF NOT EXISTS dashboard_metrics_view (
    service_id INTEGER NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    latest_value DECIMAL(10,2) NOT NULL,
    latest_timestamp TIMESTAMP NOT NULL,
    trend VARCHAR(20) DEFAULT 'stable', -- 'up', 'down', 'stable'
    updated_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (service_id, metric_type)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_service 
    ON dashboard_metrics_view(service_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_timestamp 
    ON dashboard_metrics_view(latest_timestamp DESC);

CREATE TABLE IF NOT EXISTS replication_metrics (
    id SERIAL PRIMARY KEY,
    events_processed INTEGER NOT NULL,
    events_pending INTEGER NOT NULL,
    lag_seconds DECIMAL(10,2) NOT NULL,
    processing_time_ms DECIMAL(10,2) NOT NULL,
    measured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replication_time 
    ON replication_metrics(measured_at DESC);

-- View for latest replication status
CREATE OR REPLACE VIEW replication_status AS
SELECT 
    events_processed,
    events_pending,
    lag_seconds,
    processing_time_ms,
    measured_at,
    CASE 
        WHEN lag_seconds < 1 THEN 'healthy'
        WHEN lag_seconds < 5 THEN 'warning'
        ELSE 'critical'
    END as health_status
FROM replication_metrics
ORDER BY measured_at DESC
LIMIT 1;