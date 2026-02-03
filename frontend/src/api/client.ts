// ============================================================================
// API CLIENT - Axios configuration for backend communication
// ============================================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Base URL for backend API
 * Change this if your backend runs on a different port or domain
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Runs before every request is sent
 * Useful for adding auth tokens, logging, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to requests for debugging
    console.log(` API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // You can add auth token here when you implement authentication:
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Runs after every response is received
 * Handles errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      console.error('❌ Server Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.error(' Unauthorized - Please login');
          // Redirect to login page if needed
          // window.location.href = '/login';
          break;
        case 404:
          console.error(' Not Found - Endpoint does not exist');
          break;
        case 500:
          console.error(' Server Error - Backend is having issues');
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(' Network Error - No response from backend:', error.message);
      console.error('Is your backend running on http://localhost:3000?');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 * @param url - Endpoint path (e.g., '/read/dashboard')
 * @param params - Query parameters (optional)
 */
export const get = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
};

/**
 * Generic POST request
 * @param url - Endpoint path
 * @param data - Request body
 */
export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.post<T>(url, data);
  return response.data;
};

/**
 * Generic PUT request
 * @param url - Endpoint path
 * @param data - Request body
 */
export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.put<T>(url, data);
  return response.data;
};

/**
 * Generic DELETE request
 * @param url - Endpoint path
 */
export const del = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete<T>(url);
  return response.data;
};

export default apiClient;