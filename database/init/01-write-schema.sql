CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    hostname TEXT,
    os TEXT,
    version TEXT,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- like an agent-based
CREATE TABLE IF NOT EXISTS system_metrics (
     id SERIAL PRIMARY KEY,
    agent_id UUID NOT NULL,
    cpu_usage REAL NOT NULL,
    memory_usage REAL NOT NULL,
    load_avg REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROCESS METRICS (real running apps)
CREATE TABLE IF NOT EXISTS process_metrics (
     id SERIAL PRIMARY KEY,
    agent_id UUID NOT NULL,
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
ADD CONSTRAINT fk_agent 
FOREIGN KEY(agent_id)
REFERENCES agents(id)
ON DELETE CASCADE;

ALTER TABLE process_metrics
ADD CONSTRAINT fk_agent_process 
FOREIGN KEY(agent_id)   
REFERENCES agents(id)
ON DELETE CASCADE;

CREATE INDEX idx_system_agent ON system_metrics(agent_id);
CREATE INDEX idx_process_agent ON process_metrics(agent_id);
