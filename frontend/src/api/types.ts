// ============================================================================
// API RESPONSE TYPES - Match your backend structure exactly
// ============================================================================

/**
 * Dashboard Summary Response
 * Endpoint: GET /api/read/dashboard
 */
export interface DashboardResponse {
  success: boolean;
  data: {
    id: number;
    total_services: number;
    active_services: number;
    inactive_services: number;
    critical_alerts: number;
    warning_alerts: number;
    avg_cpu_all_services: number;
    avg_memory_all_services: number;
    avg_disk_all_services: number;
    top_cpu_services: Array<{
      cpu: number;
      name: string;
      service_id: string;
    }>;
    top_memory_services: Array<{
      name: string;
      memory: number;
      service_id: string;
    }>;
    updated_at: string;
  };
}

/**
 * Latest Metrics Response
 * Endpoint: GET /api/read/metrics/latest
 */
export interface LatestMetricsResponse {
  success: boolean;
  count: number;
  data: ServiceMetric[];
}

export interface ServiceMetric {
  service_id: string;
  service_name: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  load_avg: number;
  network_rx: string; // Comes as string from backend
  network_tx: string;
  gpu_usage: number | null;
  cpu_trend: "up" | "down" | "stable";
  memory_trend: "up" | "down" | "stable";
  disk_trend: "up" | "down" | "stable";
  latest_timestamp: string;
  updated_at: string;
}

/**
 * Processes Response
 * Endpoint: GET /api/read/processes
 */
export interface ProcessesResponse {
  success: boolean;
  count: number;
  data: ProcessMetric[];
}

export interface ProcessMetric {
  serial_id: string;
  service_id: string;
  service_name: string;
  process_name: string;
  pid: number;
  cpu_usage: number;
  memory_usage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Services Response
 * Endpoint: GET /api/read/services
 */
export interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

export interface Service {
  id: number;
  service_id: string;
  name: string;
  hostname: string;
  os: string;
  status: "active" | "inactive" | "warning";
  last_heartbeat: string;
  created_at: string;
}

/**
 * Hourly Metrics Response
 * Endpoint: GET /api/read/metrics/hourly
 */
export interface HourlyMetricsResponse {
  success: boolean;
  data: HourlyMetric[];
}

export interface HourlyMetric {
  hour: string;
  avg_cpu: number;
  avg_memory: number;
  avg_disk: number;
  max_cpu: number;
  max_memory: number;
  service_count: number;
}

/**
 * Alerts Response
 * Endpoint: GET /api/read/alerts
 */
export interface AlertsResponse {
  success: boolean;
  count: number;
  data: Alert[];
}

export interface Alert {
  id: number;
  service_id: string;
  service_name: string;
  severity: "critical" | "warning" | "info";
  metric_type: string;
  threshold: number;
  current_value: number;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
}

/**
 * Trends Response
 * Endpoint: GET /api/read/trends
 */
export interface TrendsResponse {
  success: boolean;
  data: {
    cpu: TrendPoint[];
    memory: TrendPoint[];
    disk: TrendPoint[];
  };
}

export interface TrendPoint {
  timestamp: string;
  value: number;
}

// ============================================================================
// FRONTEND UI TYPES - For components
// ============================================================================

/**
 * Transformed data for dashboard stats cards
 */
export interface DashboardStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  criticalAlerts: number;
  warningAlerts: number;
  avgCpu: number;
  avgMemory: number;
  avgDisk: number;
}

/**
 * Transformed data for graph components
 */
export interface GraphDataPoint {
  name: string;      // x-axis label (e.g., "Mon", "14:00")
  value: number;     // y-axis value
  timestamp?: string; // optional full timestamp
}
