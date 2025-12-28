import { Battery, Zap, Activity, MapPin } from "lucide-react";
import {  useServiceStatus } from "@/hooks/useData";

const ServiceStatusCard = () => {
  const { data: service, isLoading } = useServiceStatus();

  if (isLoading || !service  ) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <h3 className="text-foreground font-semibold text-lg">Service Status</h3>
        <p className="text-muted-foreground text-sm">
          Hello, Here's your service info!
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Progress */}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Battery className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Battery Health</p>
              <p className="text-foreground font-semibold">{service.batteryHealth}%</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-foreground font-semibold">{service.efficiency}</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/20">
              <Zap className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consumption</p>
              <p className="text-foreground font-semibold">{service.consumption}</p>
            </div>  
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/20">
              <MapPin className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-foreground font-semibold">{service.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatusCard;
