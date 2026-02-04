// REACT QUERY HOOKS : Connect components to backend API


import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import type {
  DashboardResponse,
  LatestMetricsResponse,
  ProcessesResponse,
  ServicesResponse,
  HourlyMetricsResponse,
  AlertsResponse,
  TrendsResponse,
} from '@/api/types';

/**
 * EXPLANATION: React Query Basics
 * 
 * useQuery has 3 key parts:
 * 1. queryKey: Unique identifier for caching (like a bookmark)
 * 2. queryFn: Function that fetches data from backend
 * 3. options: When to refetch, error handling, etc.
 * 
 * Benefits:
 * - Automatic caching (doesn't refetch if data is fresh)
 * - Loading states (isLoading, isError)
 * - Auto-retry on failure
 * - Background refetching to keep data fresh
 */


// DASHBOARD HOOKS


/**
 * Get dashboard summary
 * Used by: Main dashboard page
 * Refetches: Every 10 seconds (real-time monitoring)
 */
export const useDashboard = (): UseQueryResult<DashboardResponse> => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};

/**
 * Get latest metrics for all services
 * Used by: Metrics cards, graphs
 * Refetches: Every 5 seconds (matches producer interval)
 */
export const useLatestMetrics = (): UseQueryResult<LatestMetricsResponse> => {
  return useQuery({
    queryKey: ['metrics', 'latest'],
    queryFn: api.getLatestMetrics,
    refetchInterval: 5000, // Match producer send interval
    staleTime: 3000,
  });
};

/**
 * Get latest metrics for specific service
 * @param serviceId - UUID of service to monitor
 */
export const useServiceMetrics = (
  serviceId: string | undefined
): UseQueryResult<LatestMetricsResponse> => {
  return useQuery({
    queryKey: ['metrics', 'latest', serviceId],
    queryFn: () => api.getLatestMetricsByService(serviceId!),
    enabled: !!serviceId, // Only fetch if serviceId exists
    refetchInterval: 5000,
  });
};


// SERVICES HOOKS


/**
 * Get all registered services
 * Used by: Service list, dropdown selectors
 */
export const useServices = (): UseQueryResult<ServicesResponse> => {
  return useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
    refetchInterval: 30000, // Refresh every 30 seconds (services don't change often)
    staleTime: 20000,
  });
};

/**
 * Get specific service details
 * @param serviceId - UUID of service
 */
export const useService = (
  serviceId: string | undefined
): UseQueryResult<any> => {
  return useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => api.getServiceById(serviceId!),
    enabled: !!serviceId,
    staleTime: 20000,
  });
};


// PROCESSES HOOKS


/**
 * Get all processes (or filter by service)
 * Used by: Process table
 * @param serviceId - Optional: filter by specific service
 */
export const useProcesses = (
  serviceId?: string
): UseQueryResult<ProcessesResponse> => {
  return useQuery({
    queryKey: ['processes', serviceId],
    queryFn: () => api.getProcesses(serviceId ? { service_id: serviceId } : undefined),
    refetchInterval: 10000, // Processes change frequently
    staleTime: 5000,
  });
};


// METRICS HISTORY HOOKS


/**
 * Get hourly aggregated metrics
 * Used by: Historical charts, trend analysis
 * @param options - Filter by service, time range
 */
export const useHourlyMetrics = (options?: {
  service_id?: string;
  hours?: number;
}): UseQueryResult<HourlyMetricsResponse> => {
  return useQuery({
    queryKey: ['metrics', 'hourly', options],
    queryFn: () => api.getHourlyMetrics(options),
    refetchInterval: 60000, // Hourly data doesn't change often, refetch every minute
    staleTime: 30000,
  });
};

/**
 * Get trend data for graphs
 * Used by: CPU/Memory line charts
 * @param options - Filter by service, time period
 */
export const useTrends = (options?: {
  service_id?: string;
  period?: string;
}): UseQueryResult<TrendsResponse> => {
  return useQuery({
    queryKey: ['trends', options],
    queryFn: () => api.getTrends(options),
    refetchInterval: 15000, // Refresh trends every 15 seconds
    staleTime: 10000,
  });
};


// ALERTS HOOKS


/**
 * Get system alerts
 * Used by: Alert notifications, alerts page
 * @param options - Filter by severity, resolved status
 */
export const useAlerts = (options?: {
  severity?: string;
  resolved?: boolean;
}): UseQueryResult<AlertsResponse> => {
  return useQuery({
    queryKey: ['alerts', options],
    queryFn: () => api.getAlerts(options),
    refetchInterval: 10000, // Check for new alerts every 10 seconds
    staleTime: 5000,
  });
};


// REPLICATION MONITORING HOOKS


/**
 * Get replication status
 * Used by: Admin dashboard to monitor sync health
 */
export const useReplicationStatus = (): UseQueryResult<any> => {
  return useQuery({
    queryKey: ['replication', 'status'],
    queryFn: api.getReplicationStatus,
    refetchInterval: 20000,
    staleTime: 10000,
  });
};

/**
 * Get replication metrics
 * Used by: Admin dashboard to monitor sync performance
 */
export const useReplicationMetrics = (): UseQueryResult<any> => {
  return useQuery({
    queryKey: ['replication', 'metrics'],
    queryFn: api.getReplicationMetrics,
    refetchInterval: 20000,
    staleTime: 10000,
  });
};


// HELPER HOOKS FOR TRANSFORMED DATA


/**
 * Get stats in a format ready for StatsCard components
 * Transforms dashboard data into simple values
 */
export const useDashboardStats = () => {
  const { data, isLoading, isError } = useDashboard();

  return {
    data: data
      ? {
          totalServices: data.data.total_services,
          activeServices: data.data.active_services,
          inactiveServices: data.data.inactive_services,
          criticalAlerts: data.data.critical_alerts,
          warningAlerts: data.data.warning_alerts,
          avgCpu: data.data.avg_cpu_all_services,
          avgMemory: data.data.avg_memory_all_services,
          avgDisk: data.data.avg_disk_all_services,
        }
      : null,
    isLoading,
    isError,
  };
};

/**
 * Get network stats from latest metrics
 * Calculates total network traffic across all services
 */
export const useNetworkStats = () => {
  const { data, isLoading, isError } = useLatestMetrics();

  const networkStats = data?.data.reduce(
    (acc, service) => ({
      totalRx: acc.totalRx + parseInt(service.network_rx || '0'),
      totalTx: acc.totalTx + parseInt(service.network_tx || '0'),
    }),
    { totalRx: 0, totalTx: 0 }
  );

  return {
    data: networkStats,
    isLoading,
    isError,
  };
};


// COMPATIBILITY LAYER - For old components that expect different hook names


/**
 * useStats - Compatibility wrapper for old dashboard
 * Maps to new useDashboardStats
 */
export const useStats = () => {
  const dashboardStats = useDashboardStats();
  
  // Return data in OLD format expected by existing components
  return {
    data: dashboardStats.data ? {
      todaysMoney: { 
        value: dashboardStats.data.totalServices.toString(), 
        change: `${dashboardStats.data.activeServices} active`,
        changeType: 'positive' as const 
      },
      todaysUsers: { 
        value: dashboardStats.data.activeServices.toString(), 
        change: `${dashboardStats.data.inactiveServices} inactive`,
        changeType: 'positive' as const 
      },
      newClients: { 
        value: dashboardStats.data.criticalAlerts.toString(), 
        change: `${dashboardStats.data.warningAlerts} warnings`,
        changeType: dashboardStats.data.criticalAlerts === 0 ? 'positive' as const : 'negative' as const 
      },
      totalSales: { 
        value: dashboardStats.data.avgCpu.toString() + '%', 
        change: 'CPU Usage',
        changeType: 'positive' as const 
      },
    } : null,
    isLoading: dashboardStats.isLoading,
    isError: dashboardStats.isError,
  };
};

/**
 * useWelcome - For WelcomeCard component
 */
export const useWelcome = () => {
  return useQuery({
    queryKey: ['welcome'],
    queryFn: async () => ({
      userName: 'Admin',
      greeting: 'Welcome back!',
    }),
    staleTime: Infinity, // Static data
  });
};

/**
 * useSatisfaction - For satisfaction card (maps to system health)
 */
export const useSatisfaction = () => {
  const { data: dashboard } = useDashboard();
  
  return {
    data: {
      percentage: dashboard?.data.active_services === dashboard?.data.total_services ? 100 : 0,
      label: 'System Health',
    },
    isLoading: false,
    isError: false,
  };
};

/**
 * useReferral - For referral card (maps to alert stats)
 */
export const useReferral = () => {
  const { data: dashboard } = useDashboard();
  
  return {
    data: {
      invited: dashboard?.data.total_services || 0,
      bonus: dashboard?.data.active_services || 0,
      totalScore: dashboard?.data.critical_alerts || 0,
    },
    isLoading: false,
    isError: false,
  };
};

/**
 * useServiceStatus - For ActivityStatusCard (maps to latest metrics)
 */
export const useServiceStatus = () => {
  const { data: metrics } = useLatestMetrics();
  const firstService = metrics?.data[0];
  
  return {
    data: {
      currentLoad: firstService?.cpu_usage || 0,
      timeToFullCharge: 'N/A',
      batteryHealth: firstService?.memory_usage || 0,
      efficiency: `${firstService?.cpu_trend || 'stable'}`,
      consumption: `${firstService?.memory_usage || 0}%`,
      thisWeek: `${firstService?.disk_usage || 0}%`,
    },
    isLoading: false,
    isError: false,
  };
};

/**
 * useCpuGraphData - For CPU graph (uses trends)
 */
export const useCpuGraphData = () => {
  const { data: trends, isLoading, isError } = useTrends({ period: '24h' });
  
  return {
    data: trends?.data.cpu?.map((point, index) => ({
      name: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      value: Math.round(point.value),
    })) || [],
    isLoading,
    isError,
  };
};

/**
 * useMemoryGraphData - For Memory graph (uses trends)
 */
export const useMemoryGraphData = () => {
  const { data: trends, isLoading, isError } = useTrends({ period: '24h' });
  
  return {
    data: trends?.data.memory?.map((point, index) => ({
      name: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      value: Math.round(point.value),
    })) || [],
    isLoading,
    isError,
  };
};

/**
 * useCpuStats - For CPU stats card
 */
export const useCpuStats = () => {
  const { data: dashboard } = useDashboard();
  const { data: metrics } = useLatestMetrics();
  
  return {
    data: {
      users: dashboard?.data.total_services.toString() || '0',
      clicks: metrics?.count.toString() || '0',
      sales: dashboard?.data.avg_cpu_all_services.toString() + '%' || '0%',
      items: dashboard?.data.active_services.toString() || '0',
      changePercent: '+0%',
    },
    isLoading: false,
    isError: false,
  };
};

/**
 * useProfile - For profile page
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => ({
      name: 'System Administrator',
      email: 'admin@pioneerpulse.com',
      bio: 'Pioneer Pulse - Distributed System Monitoring',
      fullName: 'System Administrator',
      mobile: 'N/A',
      location: 'System',
      avatar: '/placeholder.svg',
    }),
    staleTime: Infinity,
  });
};