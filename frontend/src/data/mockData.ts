// Real API Integration - connects to your backend
import type {
  StatsData,
  ProfileData,
  ActivityStatus,
  Project,
  Order,
  CpuGraphData,
  MemoryGraphData,
  WelcomeData,
  SatisfactionData,
  ReferralData,
  CpuStats,
} from './mockData';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API Client
const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
};

// Backend data interfaces (what your backend actually returns)
interface BackendDashboard {
  services: {
    total_services: number;
    active_services: number;
    inactive_services: number;
  };
  metrics: {
    avg_cpu: number;
    avg_memory: number;
    avg_disk: number;
    total_alerts: number;
  };
  system_health: {
    status: string;
    uptime: number;
  };
}

interface BackendService {
  id: number;
  name: string;
  hostname: string;
  os: string;
  status: string;
  last_heartbeat: string;
}

interface BackendMetric {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_rx: number;
  network_tx: number;
}

interface BackendHourlyMetric {
  hour: string;
  avg_cpu: number;
  avg_memory: number;
  max_cpu: number;
  max_memory: number;
}

// Data Adapters - Transform backend data to frontend format
const adapters = {
  dashboardToStats: (dashboard: BackendDashboard): StatsData => {
    const { services, metrics } = dashboard;
    
    return {
      todaysMoney: {
        value: `${services.active_services}`,
        change: metrics.total_alerts > 0 ? `-${metrics.total_alerts}` : "0",
        changeType: metrics.total_alerts > 0 ? "negative" : "positive",
      },
      todaysUsers: {
        value: `${services.total_services}`,
        change: `${services.active_services}`,
        changeType: "positive",
      },
      newClients: {
        value: `${Math.round(metrics.avg_cpu)}%`,
        change: metrics.avg_cpu > 80 ? "high" : "normal",
        changeType: metrics.avg_cpu > 80 ? "negative" : "positive",
      },
      totalSales: {
        value: `${Math.round(metrics.avg_memory)}%`,
        change: `${Math.round(metrics.avg_disk)}%`,
        changeType: metrics.avg_memory > 85 ? "negative" : "positive",
      },
    };
  },

  latestMetricsToActivityStatus: (metrics: BackendMetric | null): ActivityStatus => {
    if (!metrics) {
      return {
        currentLoad: 0,
        timeToFullCharge: "N/A",
        batteryHealth: 0,
        efficiency: "0%",
        consumption: "0W",
        thisWeek: "0km",
      };
    }

    return {
      currentLoad: metrics.cpu_usage,
      timeToFullCharge: `${Math.round((100 - metrics.cpu_usage) / 10)} min`,
      batteryHealth: 100 - metrics.memory_usage,
      efficiency: `${metrics.cpu_usage > 50 ? '-' : '+'}${Math.abs(metrics.cpu_usage - 50)}%`,
      consumption: `${Math.round(metrics.network_tx / 1000000)}MB/s`,
      thisWeek: `${Math.round(metrics.network_rx / 1000000000)}GB`,
    };
  },

  servicesToProjects: (services: BackendService[]): Project[] => {
    return services.map(service => ({
      name: service.name,
      members: ["/placeholder.svg", "/placeholder.svg"], // You can enhance this
      budget: service.status === "active" ? "Active" : "Inactive",
      completion: service.status === "active" ? 100 : 0,
    }));
  },

  hourlyMetricsToCpuGraph: (hourlyMetrics: BackendHourlyMetric[]): CpuGraphData[] => {
    return hourlyMetrics.map(metric => ({
      name: new Date(metric.hour).toLocaleTimeString('en-US', { hour: '2-digit' }),
      value: Math.round(metric.avg_cpu),
    }));
  },

  hourlyMetricsToMemoryGraph: (hourlyMetrics: BackendHourlyMetric[]): MemoryGraphData[] => {
    return hourlyMetrics.map(metric => ({
      name: new Date(metric.hour).toLocaleTimeString('en-US', { hour: '2-digit' }),
      value: Math.round(metric.avg_memory),
    }));
  },

  dashboardToCpuStats: (dashboard: BackendDashboard): CpuStats => {
    const { services, metrics } = dashboard;
    
    return {
      users: `${services.total_services}`,
      clicks: `${Math.round(metrics.avg_cpu)}%`,
      sales: `${Math.round(metrics.avg_memory)}%`,
      items: `${metrics.total_alerts}`,
      changePercent: metrics.avg_cpu > 50 ? `+${Math.round(metrics.avg_cpu - 50)}%` : `-${Math.round(50 - metrics.avg_cpu)}%`,
    };
  },
};

// Real API Implementation
export const api = {
  getStats: async (): Promise<StatsData> => {
    const dashboard = await apiClient.get<BackendDashboard>('/api/dashboard');
    return adapters.dashboardToStats(dashboard);
  },

  getProfile: async (): Promise<ProfileData> => {
    // This would need a user profile endpoint in your backend
    // For now, return static data
    return {
      name: "System Admin",
      email: "admin@pioneerpulse.com",
      bio: "Monitoring system administrator",
      fullName: "System Administrator",
      mobile: "N/A",
      location: "Server Location",
      avatar: "/placeholder.svg",
    };
  },

  getActivityStatus: async (): Promise<ActivityStatus> => {
    const metrics = await apiClient.get<BackendMetric>('/api/metrics/latest');
    return adapters.latestMetricsToActivityStatus(metrics);
  },

  getProjects: async (): Promise<Project[]> => {
    const services = await apiClient.get<BackendService[]>('/api/services');
    return adapters.servicesToProjects(services);
  },

  getOrders: async (): Promise<Order[]> => {
    // This could map to alerts
    const alerts = await apiClient.get<any[]>('/api/alerts');
    
    return alerts.slice(0, 6).map((alert, index) => ({
      title: alert.message || `Alert: ${alert.type}`,
      date: new Date(alert.timestamp).toLocaleString(),
      icon: "alert-circle" as const,
      color: alert.severity === "critical" ? "destructive" as const : "primary" as const,
    }));
  },

  getCpuGraphData: async (): Promise<CpuGraphData[]> => {
    const hourlyMetrics = await apiClient.get<BackendHourlyMetric[]>('/api/metrics/hourly');
    return adapters.hourlyMetricsToCpuGraph(hourlyMetrics.slice(-12)); // Last 12 hours
  },

  getMemoryGraphData: async (): Promise<MemoryGraphData[]> => {
    const hourlyMetrics = await apiClient.get<BackendHourlyMetric[]>('/api/metrics/hourly');
    return adapters.hourlyMetricsToMemoryGraph(hourlyMetrics.slice(-9)); // Last 9 hours
  },

  getWelcome: async (): Promise<WelcomeData> => {
    return {
      userName: "Admin",
      greeting: "System monitoring dashboard",
    };
  },

  getSatisfaction: async (): Promise<SatisfactionData> => {
    const dashboard = await apiClient.get<BackendDashboard>('/api/dashboard');
    const healthPercentage = 100 - (dashboard.metrics.total_alerts * 10);
    
    return {
      percentage: Math.max(0, Math.min(100, healthPercentage)),
      label: "System Health",
    };
  },

  getReferral: async (): Promise<ReferralData> => {
    const services = await apiClient.get<BackendService[]>('/api/services');
    const dashboard = await apiClient.get<BackendDashboard>('/api/dashboard');
    
    return {
      invited: services.length,
      bonus: dashboard.metrics.total_alerts,
      totalScore: dashboard.metrics.avg_cpu / 10,
    };
  },

  getCpuStats: async (): Promise<CpuStats> => {
    const dashboard = await apiClient.get<BackendDashboard>('/api/dashboard');
    return adapters.dashboardToCpuStats(dashboard);
  },
};