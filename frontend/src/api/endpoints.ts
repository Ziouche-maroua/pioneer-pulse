// ============================================================================
// API ENDPOINTS - Fixed to handle service_id requirements
// ============================================================================

import { get } from './client';
import type {
  DashboardResponse,
  LatestMetricsResponse,
  ProcessesResponse,
  ServicesResponse,
  HourlyMetricsResponse,
  AlertsResponse,
  TrendsResponse,
} from './types';

/**
 * API Service - All backend endpoints
 * Updated to handle service_id requirements
 */
export const api = {
  // ============================================================================
  // DASHBOARD
  // ============================================================================
  
  /**
   * Get dashboard summary
   * Route: GET /api/read/dashboard
   */
  getDashboard: () => get<DashboardResponse>('/read/dashboard'),

  // ============================================================================
  // SERVICES
  // ============================================================================
  
  /**
   * Get all services
   * Route: GET /api/read/services
   */
  getServices: () => get<ServicesResponse>('/read/services'),

  /**
   * Get specific service by ID
   * Route: GET /api/read/services/:id
   */
  getServiceById: (serviceId: string) => 
    get<{ success: boolean; data: any }>(`/read/services/${serviceId}`),

  // ============================================================================
  // METRICS
  // ============================================================================
  
  /**
   * Get latest metrics for all services
   * Route: GET /api/read/metrics/latest
   */
  getLatestMetrics: () => get<LatestMetricsResponse>('/read/metrics/latest'),

  /**
   * Get latest metrics for specific service
   * Route: GET /api/read/metrics/latest/:service_id
   */
  getLatestMetricsByService: (serviceId: string) => 
    get<LatestMetricsResponse>(`/read/metrics/latest/${serviceId}`),

  /**
   * Get hourly aggregated metrics
   * Route: GET /api/read/metrics/hourly
   * IMPORTANT: Backend may require service_id parameter
   */
  getHourlyMetrics: (params?: { service_id?: string; hours?: number }) => {
    // Only call if service_id is provided (backend requires it)
    if (!params?.service_id) {
      return Promise.resolve({ 
        success: false, 
        data: [] 
      } as HourlyMetricsResponse);
    }
    return get<HourlyMetricsResponse>('/read/metrics/hourly', params);
  },

  // ============================================================================
  // PROCESSES
  // ============================================================================
  
  /**
   * Get all processes
   * Route: GET /api/read/processes
   */
  getProcesses: (params?: { service_id?: string }) => 
    get<ProcessesResponse>('/read/processes', params),

  // ============================================================================
  // ALERTS
  // ============================================================================
  
  /**
   * Get alerts
   * Route: GET /api/read/alerts
   */
  getAlerts: (params?: { severity?: string; resolved?: boolean }) => 
    get<AlertsResponse>('/read/alerts', params),

  // ============================================================================
  // TRENDS & HISTORY
  // ============================================================================
  
  /**
   * Get historical trends
   * Route: GET /api/read/trends
   * IMPORTANT: Backend may require service_id parameter
   */
  getTrends: (params?: { service_id?: string; period?: string }) => {
    // Only call if service_id is provided (backend requires it)
    if (!params?.service_id) {
      return Promise.resolve({ 
        success: false, 
        data: { cpu: [], memory: [], disk: [] } 
      } as TrendsResponse);
    }
    return get<TrendsResponse>('/read/trends', params);
  },

  /**
   * Get health history
   * Route: GET /api/read/health-history
   */
  getHealthHistory: (params?: { service_id?: string; limit?: number }) => 
    get<any>('/read/health-history', params),

  // ============================================================================
  // REPLICATION STATUS
  // ============================================================================
  
  /**
   * Get replication status
   * Route: GET /api/read/replication/status
   */
  getReplicationStatus: () => 
    get<any>('/read/replication/status'),

  /**
   * Get replication metrics
   * Route: GET /api/read/replication/metrics
   */
  getReplicationMetrics: () => 
    get<any>('/read/replication/metrics'),
};

/**
 * Helper function to handle API errors gracefully
 */
export const handleApiError = async <T>(
  apiCall: Promise<T>
): Promise<T | null> => {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
};

export default api;