CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    hostname TEXT,
    os TEXT,
    version TEXT,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- like an server based
CREATE TABLE IF NOT EXISTS system_metrics (
     id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    cpu_usage REAL NOT NULL,
    memory_usage REAL NOT NULL,
    load_avg REAL,
    disk_usage REAL,
    network_rx BIGINT,
    network_tx BIGINT,
    gpu_usage REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROCESS METRICS ( running apps)
CREATE TABLE IF NOT EXISTS process_metrics (
     id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL,
    process_name TEXT,
    pid INTEGER,
    cpu_usage REAL,
    memory_usage REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- hashed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_unprocessed 
    ON events(processed, created_at) 
    WHERE processed = FALSE;

CREATE INDEX IF NOT EXISTS idx_events_type 
    ON events(event_type, created_at);

ALTER TABLE system_metrics
DROP CONSTRAINT IF EXISTS fk_service;

ALTER TABLE system_metrics
ADD CONSTRAINT fk_service 
FOREIGN KEY(service_id)
REFERENCES services(id)
ON DELETE CASCADE;

ALTER TABLE process_metrics
DROP CONSTRAINT IF EXISTS fk_service_process;

ALTER TABLE process_metrics
ADD CONSTRAINT fk_service_process 
FOREIGN KEY(service_id)   
REFERENCES services(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_system_service ON system_metrics(service_id);
CREATE INDEX IF NOT EXISTS idx_process_service ON process_metrics(service_id);
CREATE INDEX IF NOT EXISTS idx_system_created ON system_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_process_created ON process_metrics(created_at DESC);

CREATE OR REPLACE FUNCTION notify_new_event() 
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification on "events_channel" with event ID
    PERFORM pg_notify(
        'events_channel',
        json_build_object(
            'id', NEW.id,
            'event_type', NEW.event_type,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that fires AFTER every INSERT into events table
DROP TRIGGER IF EXISTS events_notify_trigger ON events;

CREATE TRIGGER events_notify_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_event();

INSERT INTO services (id, name, hostname, os, version, last_heartbeat) 
VALUES 
    (gen_random_uuid(), 'web-server-01', 'web01.local', 'Ubuntu 22.04', 'nginx/1.18', NOW()),
    (gen_random_uuid(), 'api-server-01', 'api01.local', 'Ubuntu 22.04', 'node/18.16', NOW()),
    (gen_random_uuid(), 'database-primary', 'db01.local', 'Ubuntu 22.04', 'postgresql/15', NOW()),
    (gen_random_uuid(), 'cache-redis-01', 'redis01.local', 'Ubuntu 22.04', 'redis/7.0', NOW()),
    (gen_random_uuid(), 'worker-queue-01', 'worker01.local', 'Ubuntu 22.04', 'python/3.11', NOW())
ON CONFLICT (id) DO NOTHING;
