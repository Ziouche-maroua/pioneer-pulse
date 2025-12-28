CREATE TABLE IF NOT EXISTS services_status_view (
    service_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    hostname TEXT,
    os TEXT,
    version TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'warning', 'critical'
    last_heartbeat TIMESTAMP,
    
    -- Latest metrics (denormalized for fast access)
    latest_cpu REAL,
    latest_memory REAL,
    latest_disk REAL,
    latest_load_avg REAL,
    
    -- 1-hour averages
    avg_cpu_1h REAL,
    avg_memory_1h REAL,
    avg_disk_1h REAL,
    
    -- Totals
    total_processes INTEGER DEFAULT 0,
    total_metrics_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_status ON services_status_view(status);
CREATE INDEX idx_services_last_heartbeat ON services_status_view(last_heartbeat DESC);

CREATE TABLE IF NOT EXISTS system_metrics_hourly_agg (
    service_id UUID NOT NULL,
    hour_timestamp TIMESTAMP NOT NULL,
    
    -- CPU stats
    avg_cpu REAL NOT NULL,
    min_cpu REAL NOT NULL,
    max_cpu REAL NOT NULL,
    
    -- Memory stats
    avg_memory REAL NOT NULL,
    min_memory REAL NOT NULL,
    max_memory REAL NOT NULL,
    
    -- Disk stats
    avg_disk REAL,
    min_disk REAL,
    max_disk REAL,
    
    -- Load average stats
    avg_load REAL,
    min_load REAL,
    max_load REAL,
    
    -- Network stats (cumulative)
    total_network_rx BIGINT DEFAULT 0,
    total_network_tx BIGINT DEFAULT 0,
    
    -- GPU stats
    avg_gpu REAL,
    max_gpu REAL,
    
    -- Metadata
    sample_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (service_id, hour_timestamp)
);

CREATE INDEX idx_hourly_service_time ON system_metrics_hourly_agg(service_id, hour_timestamp DESC);
CREATE INDEX idx_hourly_time ON system_metrics_hourly_agg(hour_timestamp DESC);

CREATE TABLE IF NOT EXISTS system_metrics_latest_view (
    service_id UUID PRIMARY KEY,
    service_name TEXT NOT NULL, -- Denormalized!
    
    -- Latest values
    cpu_usage REAL NOT NULL,
    memory_usage REAL NOT NULL,
    disk_usage REAL,
    load_avg REAL,
    network_rx BIGINT,
    network_tx BIGINT,
    gpu_usage REAL,
    
    -- Trends (compared to previous reading)
    cpu_trend TEXT DEFAULT 'stable', -- 'up', 'down', 'stable'
    memory_trend TEXT DEFAULT 'stable',
    disk_trend TEXT DEFAULT 'stable',
    
    -- Timestamp
    latest_timestamp TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_latest_timestamp ON system_metrics_latest_view(latest_timestamp DESC);
CREATE INDEX idx_latest_cpu ON system_metrics_latest_view(cpu_usage DESC);
CREATE INDEX idx_latest_memory ON system_metrics_latest_view(memory_usage DESC);

CREATE TABLE IF NOT EXISTS process_metrics_view (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    service_name TEXT NOT NULL, -- Denormalized!
    
    process_name TEXT NOT NULL,
    pid INTEGER,
    
    cpu_usage REAL NOT NULL,
    memory_usage REAL NOT NULL,
    
    timestamp TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_process_service ON process_metrics_view(service_id);
CREATE INDEX idx_process_cpu ON process_metrics_view(cpu_usage DESC);
CREATE INDEX idx_process_memory ON process_metrics_view(memory_usage DESC);
CREATE INDEX idx_process_timestamp ON process_metrics_view(timestamp DESC);

CREATE TABLE IF NOT EXISTS alert_triggers_view (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    service_name TEXT NOT NULL, -- Denormalized!
    
    alert_type TEXT NOT NULL, -- 'cpu_high', 'memory_high', 'disk_full', 'service_down'
    severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
    
    current_value REAL,
    threshold_value REAL,
    
    message TEXT NOT NULL,
    
    triggered_at TIMESTAMP NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_alerts_service ON alert_triggers_view(service_id);
CREATE INDEX idx_alerts_unresolved ON alert_triggers_view(resolved, triggered_at DESC);
CREATE INDEX idx_alerts_severity ON alert_triggers_view(severity, triggered_at DESC);

CREATE TABLE IF NOT EXISTS dashboard_summary_view (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Service stats
    total_services INTEGER DEFAULT 0,
    active_services INTEGER DEFAULT 0,
    inactive_services INTEGER DEFAULT 0,
    
    -- Alert stats
    critical_alerts INTEGER DEFAULT 0,
    warning_alerts INTEGER DEFAULT 0,
    
    -- System-wide averages
    avg_cpu_all_services REAL DEFAULT 0,
    avg_memory_all_services REAL DEFAULT 0,
    avg_disk_all_services REAL DEFAULT 0,
    
    -- Top resource consumers (JSON)
    top_cpu_services JSONB DEFAULT '[]'::jsonb,
    top_memory_services JSONB DEFAULT '[]'::jsonb,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial row
INSERT INTO dashboard_summary_view (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS replication_metrics (
    id SERIAL PRIMARY KEY,
    events_processed INTEGER NOT NULL,
    events_pending INTEGER NOT NULL,
    lag_seconds DECIMAL(10,2) NOT NULL,
    processing_time_ms DECIMAL(10,2) NOT NULL,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replication_time ON replication_metrics(measured_at DESC);

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

CREATE TABLE IF NOT EXISTS service_health_history (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    service_name TEXT NOT NULL,
    
    status TEXT NOT NULL, -- 'active', 'inactive', 'warning', 'critical'
    status_changed_from TEXT,
    
    -- Metrics at time of status change
    cpu_usage REAL,
    memory_usage REAL,
    disk_usage REAL,
    
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_history_service ON service_health_history(service_id, timestamp DESC);
CREATE INDEX idx_health_history_status ON service_health_history(status, timestamp DESC);

CREATE TABLE IF NOT EXISTS performance_trends (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    service_name TEXT NOT NULL,
    
    period_type TEXT NOT NULL, -- 'daily', 'weekly'
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Averages for period
    avg_cpu REAL,
    avg_memory REAL,
    avg_disk REAL,
    avg_load REAL,
    
    -- Peak values
    peak_cpu REAL,
    peak_memory REAL,
    peak_disk REAL,
    
    -- Uptime
    uptime_percentage REAL,
    total_downtime_minutes INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(service_id, period_type, period_start)
);

CREATE INDEX idx_trends_service ON performance_trends(service_id, period_start DESC);