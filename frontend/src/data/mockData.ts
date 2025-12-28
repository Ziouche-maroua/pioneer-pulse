// Mock data - replace fetch URLs with your API endpoints when backend is ready

export interface StatsData {
  todaysMoney: { value: string; change: string; changeType: "positive" | "negative" };
  todaysUsers: { value: string; change: string; changeType: "positive" | "negative" };
  newClients: { value: string; change: string; changeType: "positive" | "negative" };
  totalSales: { value: string; change: string; changeType: "positive" | "negative" };
}

export interface ProfileData {
  name: string;
  email: string;
  bio: string;
  fullName: string;
  mobile: string;
  location: string;
  avatar: string;
}

export interface ServiceStatus {
  currentLoad: number;
  timeToFullCharge: string;
  batteryHealth: number;
  efficiency: string;
  consumption: string;
  thisWeek: string;
}


export interface Process {
  serial_id: string;
  service_id: string;
  process_name: string;
  pid: number;
  cpu_usage: number;
  memory_usage: number;
  created_at: string;
}

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

// Mock data store - simulates API responses
export const mockData = {
  stats: {
    todaysMoney: { value: "$53,000", change: "55%", changeType: "positive" as const },
    todaysUsers: { value: "2,300", change: "3%", changeType: "positive" as const },
    newClients: { value: "+1,052", change: "2%", changeType: "negative" as const },
    totalSales: { value: "$173,000", change: "8%", changeType: "positive" as const },
  },
  profile: {
    name: "Picv",
    email: "exemple@gmail.com",
    bio: "Hi, I'm Pichou_Dev. Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality).",
    fullName: "Pichou_Dev",
    mobile: "(44) 123 1234 123",
    location: "United States",
    socialMedia: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
    },
    avatar: "/placeholder.svg",
  },
  ServiceStatus: {
    currentLoad: 68,
    timeToFullCharge: "0h 58 min",
    batteryHealth: 76,
    efficiency: "+20%",
    consumption: "163W/km",
    thisWeek: "1.342km",
  },
 
  processes: [
    { serial_id: "a1b2c3d4", service_id: "web-server-1", process_name: "nginx", pid: 12345, cpu_usage: 12.5, memory_usage: 5.8, created_at: new Date(Date.now() - 1000 * 10).toISOString() },
    { serial_id: "e5f6g7h8", service_id: "db-main", process_name: "postgres", pid: 67890, cpu_usage: 45.2, memory_usage: 25.1, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { serial_id: "i9j0k1l2", service_id: "auth-service", process_name: "node", pid: 10112, cpu_usage: 5.1, memory_usage: 15.3, created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { serial_id: "m3n4o5p6", service_id: "cache-redis", process_name: "redis-server", pid: 13141, cpu_usage: 2.8, memory_usage: 8.9, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { serial_id: "q7r8s9t0", service_id: "log-aggregator", process_name: "vector", pid: 15161, cpu_usage: 8.9, memory_usage: 12.0, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  ],
  cpuGraphData: [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 45 },
    { name: "Wed", value: 35 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 55 },
    { name: "Sat", value: 40 },
    { name: "Sun", value: 70 },
    { name: "Mon", value: 65 },
    { name: "Tue", value: 50 },
    { name: "Wed", value: 75 },
    { name: "Thu", value: 85 },
    { name: "Fri", value: 80 },
  ],
  memoryGraphData: [
    { name: "Mon", value: 45 },
    { name: "Tue", value: 65 },
    { name: "Wed", value: 55 },
    { name: "Thu", value: 80 },
    { name: "Fri", value: 70 },
    { name: "Sat", value: 60 },
    { name: "Sun", value: 85 },
    { name: "Mon", value: 75 },
    { name: "Tue", value: 90 },
  ],
  welcome: {
    userName: "pichou_dev",
    greeting: "Glad to see you again!",
  },
  satisfaction: {
    percentage: 95,
    label: "From all projects",
  },
  referral: {
    invited: 145,
    bonus: 1465,
    totalScore: 9.3,
  },
  cpuStats: {
    users: "32,984",
    clicks: "2.42m",
    sales: "2,400$",
    items: "320",
    changePercent: "+5%",
  },
};

// Real API Implementation
export const api = {
  // When backend is ready, replace the mock returns with actual fetch calls
  // Example: return fetch(`${API_BASE_URL}/stats`).then(res => res.json());

  getStats: async (): Promise<StatsData> => {
    await delay(100);
    return mockData.stats;
  },
  getProfile: async (): Promise<ProfileData> => {
    await delay(100);
    return mockData.profile;
  },
  getServiceStatus: async (): Promise<ServiceStatus> => {
    await delay(100);
    return mockData.ServiceStatus;
  },
 
  getProcesses: async (): Promise<Process[]> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/processes`).then(res => res.json());
    return mockData.processes;
  },
  getCpuGraphData: async (): Promise<CpuGraphData[]> => {
    await delay(100);
    return mockData.cpuGraphData;
  },
  getMemoryGraphData: async (): Promise<MemoryGraphData[]> => {
    await delay(100);
    return mockData.memoryGraphData;
  },
  getWelcome: async (): Promise<WelcomeData> => {
    await delay(100);
    return mockData.welcome;
  },
  getSatisfaction: async (): Promise<SatisfactionData> => {
    await delay(100);
    return mockData.satisfaction;
  },
  getReferral: async (): Promise<ReferralData> => {
    await delay(100);
    return mockData.referral;
  },
  getCpuStats: async (): Promise<CpuStats> => {
    await delay(100);
    return mockData.cpuStats;
  },
};
