// ============================================================================
// UTILITY FUNCTIONS - Helper functions for data formatting
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 * Used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human-readable format
 * Examples:
 *   1024 → "1 KB"
 *   1048576 → "1 MB"
 *   1073741824 → "1 GB"
 * 
 * @param bytes - Number of bytes
 * @param decimals - Decimal places (default: 2)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format percentage with color coding
 * Returns color class based on value
 * 
 * @param value - Percentage value (0-100)
 * @param inverse - If true, higher is worse (e.g., CPU usage)
 */
export function getPercentageColor(value: number, inverse: boolean = false): string {
  if (inverse) {
    if (value < 50) return 'text-green-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-red-500';
  } else {
    if (value > 80) return 'text-green-500';
    if (value > 50) return 'text-yellow-500';
    return 'text-red-500';
  }
}

/**
 * Format timestamp to relative time
 * Examples:
 *   "2 minutes ago"
 *   "5 hours ago"
 *   "yesterday"
 * 
 * @param timestamp - ISO timestamp string
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return past.toLocaleDateString();
}

/**
 * Format timestamp to time only (HH:MM:SS)
 * 
 * @param timestamp - ISO timestamp string
 */
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format timestamp to date and time
 * 
 * @param timestamp - ISO timestamp string
 */
export function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 * 
 * @param status - Service status ('active', 'inactive', 'warning')
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500/20 text-green-500 border-green-500/50';
    case 'inactive':
      return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
    case 'critical':
      return 'bg-red-500/20 text-red-500 border-red-500/50';
    default:
      return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
  }
}

/**
 * Get trend icon and color
 * 
 * @param trend - Trend direction ('up', 'down', 'stable')
 */
export function getTrendStyle(trend: string): { icon: string; color: string } {
  switch (trend.toLowerCase()) {
    case 'up':
      return { icon: '↑', color: 'text-red-500' };
    case 'down':
      return { icon: '↓', color: 'text-green-500' };
    case 'stable':
      return { icon: '→', color: 'text-blue-500' };
    default:
      return { icon: '•', color: 'text-gray-500' };
  }
}

/**
 * Calculate uptime from seconds
 * Returns: "2d 5h 30m"
 * 
 * @param seconds - Uptime in seconds
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
}

/**
 * Convert hourly metric timestamp to hour label
 * "2025-02-01T14:00:00Z" → "14:00"
 * 
 * @param timestamp - ISO timestamp
 */
export function formatHourLabel(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Safely parse number from string
 * Used for network_rx and network_tx which come as strings
 * 
 * @param value - String or number
 */
export function safeParseNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}