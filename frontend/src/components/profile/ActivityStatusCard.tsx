import { Battery, Zap, Activity, HardDrive } from "lucide-react";
import { useLatestMetrics } from "@/hooks/useData";

const ServiceStatusCard = () => {
  const { data: metrics, isLoading } = useLatestMetrics();

  if (isLoading || !metrics?.data?.[0]) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  const service = metrics.data[0];

  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <h3 className="text-foreground font-semibold text-lg">Service Status</h3>
        <p className="text-muted-foreground text-sm">
          Current system metrics for {service.service_name}
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPU Usage</p>
              <p className="text-foreground font-semibold">{service.cpu_usage}%</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Battery className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Memory</p>
              <p className="text-foreground font-semibold">{service.memory_usage}%</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/20">
              <HardDrive className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Disk</p>
              <p className="text-foreground font-semibold">{service.disk_usage}%</p>
            </div>  
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/20">
              <Zap className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Load Avg</p>
              <p className="text-foreground font-semibold">{service.load_avg.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatusCard;