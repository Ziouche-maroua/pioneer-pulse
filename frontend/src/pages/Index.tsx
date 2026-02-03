// ============================================================================
// DASHBOARD PAGE
// ============================================================================

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import CPUGraph from "@/components/dashboard/CPUGraph";
import MemoryGraph from "@/components/dashboard/MemoryGraph";
import ProcessesTable from "@/components/dashboard/ProcessesTable";
import ServiceStatusCard from "@/components/profile/ActivityStatusCard";
import {
  Server,
  Activity,
  AlertTriangle,
  Cpu,
  MemoryStick,
  HardDrive,
  Download,
  Upload,
  CheckCircle,
} from "lucide-react";
import jellyfishBg from "@/assets/jellyfish-bg.jpg";
import { 
  useDashboard, 
  useLatestMetrics,
  useAlerts 
} from "@/hooks/useData";
import { formatBytes } from "@/lib/utils";

const Index = () => {
  // Fetch data from backend
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: metrics, isLoading: metricsLoading } = useLatestMetrics();
  const { data: alerts } = useAlerts({ resolved: false });

  // Add dark class to html for proper theming
  document.documentElement.classList.add('dark');

  // Get current service metrics (the FRESH data)
  const currentService = metrics?.data?.[0];

  // Calculate total network traffic across all services
  const networkStats = metrics?.data.reduce(
    (acc, service) => ({
      totalRx: acc.totalRx + parseInt(service.network_rx || '0'),
      totalTx: acc.totalTx + parseInt(service.network_tx || '0'),
    }),
    { totalRx: 0, totalTx: 0 }
  ) || { totalRx: 0, totalTx: 0 };

  const isLoading = dashboardLoading || metricsLoading;

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${jellyfishBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 pointer-events-none" />

      {/* Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto relative z-10">
        <Header />

        {/* SECTION 1: SERVICE OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            // Loading skeletons
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            <>
              {/* Total Services */}
              <StatsCard
                title="Total Services"
                value={dashboard?.data.total_services.toString() || "0"}
                subtitle="Registered services"
                icon={Server}
                trend={{
                  value: `${dashboard?.data.active_services || 0} active`,
                  isPositive: true,
                }}
              />

              {/* Active Services */}
              <StatsCard
                title="Active Services"
                value={dashboard?.data.active_services.toString() || "0"}
                subtitle="Currently running"
                icon={CheckCircle}
                trend={{
                  value: `${dashboard?.data.inactive_services || 0} inactive`,
                  isPositive: dashboard?.data.inactive_services === 0,
                }}
              />

              {/* Critical Alerts */}
              <StatsCard
                title="Critical Alerts"
                value={dashboard?.data.critical_alerts.toString() || "0"}
                subtitle="Require attention"
                icon={AlertTriangle}
                trend={{
                  value: `${dashboard?.data.warning_alerts || 0} warnings`,
                  isPositive: dashboard?.data.critical_alerts === 0,
                }}
              />

              {/* System Health */}
              <StatsCard
                title="System Health"
                value={alerts?.count === 0 ? "Healthy" : "Issues"}
                subtitle={`${alerts?.count || 0} active alerts`}
                icon={Activity}
                trend={{
                  value: alerts?.count === 0 ? "All systems operational" : "Check alerts",
                  isPositive: alerts?.count === 0,
                }}
              />
            </>
          )}
        </div>

        {/* SECTION 2: METRICS CARDS - USE LATEST METRICS (FRESH DATA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            <>
              {/* CPU Usage - FROM LATEST METRICS */}
              <StatsCard
                title="CPU Usage"
                value={`${currentService?.cpu_usage || dashboard?.data.avg_cpu_all_services || 0}%`}
                subtitle="Current usage"
                icon={Cpu}
                trend={{
                  value: currentService?.cpu_trend 
                    ? `Trend: ${currentService.cpu_trend}` 
                    : dashboard?.data.top_cpu_services?.[0]
                      ? `Top: ${dashboard.data.top_cpu_services[0].name}`
                      : "No data",
                  isPositive: (currentService?.cpu_usage || dashboard?.data.avg_cpu_all_services || 0) < 70,
                }}
              />

              {/* Memory Usage - FROM LATEST METRICS */}
              <StatsCard
                title="Memory Usage"
                value={`${currentService?.memory_usage || dashboard?.data.avg_memory_all_services || 0}%`}
                subtitle="Current usage"
                icon={MemoryStick}
                trend={{
                  value: currentService?.memory_trend 
                    ? `Trend: ${currentService.memory_trend}` 
                    : dashboard?.data.top_memory_services?.[0]
                      ? `Top: ${dashboard.data.top_memory_services[0].name}`
                      : "No data",
                  isPositive: (currentService?.memory_usage || dashboard?.data.avg_memory_all_services || 0) < 80,
                }}
              />

              {/* Disk Usage - FROM LATEST METRICS */}
              <StatsCard
                title="Disk Usage"
                value={`${currentService?.disk_usage || dashboard?.data.avg_disk_all_services || 0}%`}
                subtitle="Current usage"
                icon={HardDrive}
                trend={{
                  value: currentService?.disk_trend 
                    ? `Trend: ${currentService.disk_trend}` 
                    : (dashboard?.data.avg_disk_all_services || 0) < 80 
                      ? "Healthy" 
                      : "High usage",
                  isPositive: (currentService?.disk_usage || dashboard?.data.avg_disk_all_services || 0) < 80,
                }}
              />
            </>
          )}
        </div>

        {/* SECTION 3: NETWORK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            <>
              {/* Network Received */}
              <StatsCard
                title="Network RX"
                value={formatBytes(networkStats.totalRx)}
                subtitle="Total received"
                icon={Download}
                trend={{
                  value: `${metrics?.count || 0} services`,
                  isPositive: true,
                }}
              />

              {/* Network Transmitted */}
              <StatsCard
                title="Network TX"
                value={formatBytes(networkStats.totalTx)}
                subtitle="Total transmitted"
                icon={Upload}
                trend={{
                  value: `${metrics?.count || 0} services`,
                  isPositive: true,
                }}
              />
            </>
          )}
        </div>

        {/* SECTION 4: WELCOME + STATUS CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <WelcomeCard />
          <ServiceStatusCard />
        </div>

        {/* SECTION 5: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <CPUGraph />
          </div>
          <MemoryGraph />
        </div>

        {/* SECTION 6: PROCESSES TABLE */}
        <ProcessesTable />

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2025, Made with ❤️ by Pioneer Team</p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Ziouche-maroua/pioneer-pulse/" 
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

/**
 * Loading skeleton component for stats cards
 */
const LoadingSkeleton = () => (
  <div className="glass-card-hover p-5 animate-pulse">
    <div className="h-16 bg-muted rounded" />
  </div>
);

export default Index;