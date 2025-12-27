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



ALTER TABLE system_metrics
ADD CONSTRAINT fk_service 
FOREIGN KEY(service_id)
REFERENCES services(id)
ON DELETE CASCADE;

ALTER TABLE process_metrics
ADD CONSTRAINT fk_service_process 
FOREIGN KEY(service_id)   
REFERENCES services(id)
ON DELETE CASCADE;

CREATE INDEX idx_system_service ON system_metrics(service_id);
CREATE INDEX idx_process_service ON process_metrics(service_id);
