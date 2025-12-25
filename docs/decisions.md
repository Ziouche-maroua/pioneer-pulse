## Why Node.js?

Node.js offers asynchronous I/O, making it suitable for high-frequency metric ingestion.

## Why Read Replicas?

Dashboards are read-heavy. Separating reads from writes improves scalability.

## Why Eventual Consistency?

Monitoring systems tolerate slight delays in favor of performance.