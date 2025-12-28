import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import CPUGraph from "@/components/dashboard/CPUGraph";
import MemoryGraph from "@/components/dashboard/MemoryGraph";
import ProcessesTable from "@/components/dashboard/ProcessesTable";
import { Wallet, Users, FileText, TrendingUp, BellElectric, Power, MemoryStick, Save, DatabaseIcon, Network, Cpu, GitGraphIcon, BellElectricIcon, CpuIcon, NetworkIcon } from "lucide-react";
import jellyfishBg from "@/assets/jellyfish-bg.jpg";
import { useStats } from "@/hooks/useData";
import ServiceStatusCard from "@/components/profile/ActivityStatusCard";

const Index = () => {
  const { data: stats, isLoading } = useStats();

  // Add dark class to html for proper theming
  document.documentElement.classList.add('dark');

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

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            <>
              <div className="glass-card-hover p-5 animate-pulse"><div className="h-16 bg-muted rounded" /></div>
              <div className="glass-card-hover p-5 animate-pulse"><div className="h-16 bg-muted rounded" /></div>
              <div className="glass-card-hover p-5 animate-pulse"><div className="h-16 bg-muted rounded" /></div>
              <div className="glass-card-hover p-5 animate-pulse"><div className="h-16 bg-muted rounded" /></div>
            </>
          ) : (
            <>
              <StatsCard
                title="CPU Usage"
                value={stats?.todaysMoney.value || "$0"}
                
                icon={Cpu}
              />
              <StatsCard
                title="Memory usage"
                value={stats?.todaysUsers.value || "0"}

                icon={MemoryStick}
              />
              <StatsCard
                title="Disk usage"
                value={stats?.newClients.value || "0"}
      
                icon={DatabaseIcon}
              />
              <StatsCard
                title="GPU usage"
                value={stats?.totalSales.value || "$0"}
              
                icon={CpuIcon}
              />

              <StatsCard
                title="Network tx"
                value={stats?.totalSales.value || "$0"}
        
                icon={Network}
              />
              <StatsCard
                title="Network rx"
                value={stats?.totalSales.value || "$0"}
        
                icon={NetworkIcon}
              />
              
            </>
          )}
        </div>

        {/* Welcome + Satisfaction + Referral Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <WelcomeCard />
          <ServiceStatusCard />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <CPUGraph />
          </div>
          <MemoryGraph />
        </div>
          <ProcessesTable />
        
        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2025, Made with ❤️ by Pioneer Team</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Ziouche-maroua/pioneer-pulse/" className="hover:text-foreground transition-colors">License</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;