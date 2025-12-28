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

export interface ActivityStatus {
  currentLoad: number;
  timeToFullCharge: string;
  batteryHealth: number;
  efficiency: string;
  consumption: string;
  thisWeek: string;
}

export interface Project {
  name: string;
  members: string[];
  budget: string;
  completion: number;
}

export interface Order {
  title: string;
  date: string;
  icon: "bell" | "credit-card" | "cart" | "droplet" | "file-text" | "key" | "alert-circle";
  color: "primary" | "destructive" | "teal" | "coral" | "purple";
}

export interface CpuGraphData {
  name: string;
  value: number;
}

export interface MemoryGraphData {
  name: string;
  value: number;
}

export interface WelcomeData {
  userName: string;
  greeting: string;
}

export interface SatisfactionData {
  percentage: number;
  label: string;
}

export interface ReferralData {
  invited: number;
  bonus: number;
  totalScore: number;
}

export interface CpuStats {
  users: string;
  clicks: string;
  sales: string;
  items: string;
  changePercent: string;
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
    name: "Pichou_dev",
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
  activityStatus: {
    currentLoad: 68,
    timeToFullCharge: "0h 58 min",
    batteryHealth: 76,
    efficiency: "+20%",
    consumption: "163W/km",
    thisWeek: "1.342km",
  },
  projects: [
    { name: "Chakra Vision UI", members: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], budget: "$14,000", completion: 60 },
    { name: "Add Progress Track", members: ["/placeholder.svg", "/placeholder.svg"], budget: "$3,000", completion: 10 },
    { name: "Fix Platform Errors", members: ["/placeholder.svg", "/placeholder.svg"], budget: "Not Set", completion: 100 },
    { name: "Launch our Mobile App", members: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], budget: "$32,000", completion: 100 },
    { name: "Add the New Pricing", members: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], budget: "$400", completion: 25 },
    { name: "Redesign New Online Shop", members: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], budget: "$8,000", completion: 40 },
  ],
  orders: [
    { title: "$2400, Design changes", date: "22 DEC 7:20 PM", icon: "bell" as const, color: "primary" as const },
    { title: "New order #4219423", date: "21 DEC 11:21 PM", icon: "file-text" as const, color: "destructive" as const },
    { title: "Server Payments for April", date: "21 DEC 9:28 PM", icon: "cart" as const, color: "teal" as const },
    { title: "New card added for order #3210145", date: "20 DEC 3:52 PM", icon: "credit-card" as const, color: "coral" as const },
    { title: "Unlock packages for development", date: "19 DEC 11:35 PM", icon: "key" as const, color: "purple" as const },
    { title: "New order #9851258", date: "18 DEC 4:41 PM", icon: "alert-circle" as const, color: "primary" as const },
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

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API service - replace these URLs with your actual endpoints
const API_BASE_URL = "/api"; // Change this to your backend URL

export const api = {
  // When backend is ready, replace the mock returns with actual fetch calls
  // Example: return fetch(`${API_BASE_URL}/stats`).then(res => res.json());
  
  getStats: async (): Promise<StatsData> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/stats`).then(res => res.json());
    return mockData.stats;
  },

  getProfile: async (): Promise<ProfileData> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/profile`).then(res => res.json());
    return mockData.profile;
  },

  getActivityStatus: async (): Promise<ActivityStatus> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/activity-status`).then(res => res.json());
    return mockData.activityStatus;
  },

  getProjects: async (): Promise<Project[]> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/projects`).then(res => res.json());
    return mockData.projects;
  },

  getOrders: async (): Promise<Order[]> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/orders`).then(res => res.json());
    return mockData.orders;
  },

  getCpuGraphData: async (): Promise<CpuGraphData[]> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/cpu-graph`).then(res => res.json());
    return mockData.cpuGraphData;
  },

  getMemoryGraphData: async (): Promise<MemoryGraphData[]> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/memory-graph`).then(res => res.json());
    return mockData.memoryGraphData;
  },

  getWelcome: async (): Promise<WelcomeData> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/welcome`).then(res => res.json());
    return mockData.welcome;
  },

  getSatisfaction: async (): Promise<SatisfactionData> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/satisfaction`).then(res => res.json());
    return mockData.satisfaction;
  },

  getReferral: async (): Promise<ReferralData> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/referral`).then(res => res.json());
    return mockData.referral;
  },

  getCpuStats: async (): Promise<CpuStats> => {
    await delay(100);
    // TODO: Replace with: return fetch(`${API_BASE_URL}/cpu-stats`).then(res => res.json());
    return mockData.cpuStats;
  },
};