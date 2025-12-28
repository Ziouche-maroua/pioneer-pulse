import { Battery, Zap, Activity, MapPin } from "lucide-react";
import { useActivityStatus } from "@/hooks/useData";

const ActivityStatusCard = () => {
  const { data: activity, isLoading } = useActivityStatus();

  if (isLoading || !activity) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <h3 className="text-foreground font-semibold text-lg">Activity Status</h3>
        <p className="text-muted-foreground text-sm">
          Hello, {activity.currentLoad}% Here's your activity percentage so far!
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Progress */}
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${activity.currentLoad * 2.51} 251`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{activity.currentLoad}%</span>
              <span className="text-xs text-muted-foreground">Current load</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">{activity.timeToFullCharge}</p>
            <p className="text-xs text-muted-foreground">Time to full charge</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Battery className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Battery Health</p>
              <p className="text-foreground font-semibold">{activity.batteryHealth}%</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-foreground font-semibold">{activity.efficiency}</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/20">
              <Zap className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consumption</p>
              <p className="text-foreground font-semibold">{activity.consumption}</p>
            </div>
          </div>

          <div className="glass-card p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/20">
              <MapPin className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-foreground font-semibold">{activity.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatusCard;
