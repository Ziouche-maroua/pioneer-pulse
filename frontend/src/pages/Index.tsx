import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import SatisfactionCard from "@/components/dashboard/SatisfactionCard";
import ReferralCard from "@/components/dashboard/ReferralCard";
import CPUGraph from "@/components/dashboard/CPUGraph";
import MemoryGraph from "@/components/dashboard/MemoryGraph";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import OrdersOverview from "@/components/dashboard/OrdersOverview";
import { Wallet, Users, FileText, TrendingUp } from "lucide-react";
import jellyfishBg from "@/assets/jellyfish-bg.jpg";
import { useStats } from "@/hooks/useData";

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
                title="Today's Money"
                value={stats?.todaysMoney.value || "$0"}
                change={stats?.todaysMoney.change || "0%"}
                changeType={stats?.todaysMoney.changeType || "positive"}
                icon={Wallet}
              />
              <StatsCard
                title="Today's Users"
                value={stats?.todaysUsers.value || "0"}
                change={stats?.todaysUsers.change || "0%"}
                changeType={stats?.todaysUsers.changeType || "positive"}
                icon={Users}
              />
              <StatsCard
                title="New Clients"
                value={stats?.newClients.value || "0"}
                change={stats?.newClients.change || "0%"}
                changeType={stats?.newClients.changeType || "positive"}
                icon={FileText}
              />
              <StatsCard
                title="Total Sales"
                value={stats?.totalSales.value || "$0"}
                change={stats?.totalSales.change || "0%"}
                changeType={stats?.totalSales.changeType || "positive"}
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        {/* Welcome + Satisfaction + Referral Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <WelcomeCard />
          <SatisfactionCard />
          <div className="relative">
            <ReferralCard />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <CPUGraph />
          </div>
          <MemoryGraph />
        </div>

        {/* Projects + Orders Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ProjectsTable />
          </div>
          <OrdersOverview />
        </div>

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