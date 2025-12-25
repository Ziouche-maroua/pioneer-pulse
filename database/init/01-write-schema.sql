

-- services table (monitored services/entities)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    hostname VARCHAR(255) NOT NULL,
    ip_address INET,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Metrics: Time-series data (CPU, memory, disk, etc.)
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'cpu', 'memory', 'disk'
    value DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT fk_metrics_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE
);

-- Indexes for write performance
CREATE INDEX IF NOT EXISTS idx_metrics_service_time 
    ON metrics(service_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_type_time 
    ON metrics(metric_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at 
    ON metrics(recorded_at DESC);

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_id INTEGER,
    metric_type VARCHAR(100) NOT NULL,
    condition VARCHAR(10) NOT NULL, -- '>', '<', '>=', '<=', '=='
    threshold DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_alert_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE
);

-- EVENTS TABLE 
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- 'metric_recorded', 'service_created', etc.
    aggregate_type VARCHAR(50) NOT NULL, -- 'service', 'metric', 'alert'
    aggregate_id INTEGER NOT NULL, -- ID of the entity
    payload JSONB NOT NULL, -- Full event data
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP NULL
);

-- Critical index: Only unprocessed events
CREATE INDEX IF NOT EXISTS idx_events_unprocessed 
    ON events(processed, created_at) 
    WHERE processed = FALSE;

CREATE INDEX IF NOT EXISTS idx_events_type 
    ON events(event_type, created_at);

-- SAMPLE DATA (for testing)
INSERT INTO services (name, hostname, ip_address) VALUES 
    ('web-api', 'web-01.local', '192.168.1.10'),
    ('auth-service', 'auth-01.local', '192.168.1.11'),
    ('database', 'db-01.local', '192.168.1.20'),
    ('cache-redis', 'cache-01.local', '192.168.1.30'),
    ('queue-worker', 'worker-01.local', '192.168.1.40')
ON CONFLICT (name) DO NOTHING;

-- Sample alert rule
INSERT INTO alert_rules (name, metric_type, condition, threshold) VALUES
    ('High CPU Warning', 'cpu', '>', 80.0),
    ('Low Memory Alert', 'memory', '<', 1024.0)
ON CONFLICT DO NOTHING;