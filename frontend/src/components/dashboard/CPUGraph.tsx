import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCpuGraphData, useCpuStats } from "@/hooks/useData";

const CPUGraph = () => {
  const { data: graphData, isLoading: graphLoading } = useCpuGraphData();
  const { data: stats, isLoading: statsLoading } = useCpuStats();

  if (graphLoading || statsLoading) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-foreground font-semibold">CPU Graph</h3>
          <p className="text-muted-foreground text-xs">{stats?.changePercent} than last week</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground text-xs">CPU Usage</span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 85%, 70%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(0, 85%, 70%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(260, 5%, 60%)', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(260, 5%, 60%)', fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(260, 15%, 12%)', 
                border: '1px solid hsl(260, 15%, 20%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 98%)'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(0, 85%, 70%)"
              strokeWidth={2}
              fill="url(#cpuGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-foreground font-bold">{stats?.users}</p>
          <p className="text-muted-foreground text-xs">Users</p>
        </div>
        <div className="text-center">
          <p className="text-foreground font-bold">{stats?.clicks}</p>
          <p className="text-muted-foreground text-xs">Clicks</p>
        </div>
        <div className="text-center">
          <p className="text-foreground font-bold">{stats?.sales}</p>
          <p className="text-muted-foreground text-xs">Sales</p>
        </div>
        <div className="text-center">
          <p className="text-foreground font-bold">{stats?.items}</p>
          <p className="text-muted-foreground text-xs">Items</p>
        </div>
      </div>
    </div>
  );
};

export default CPUGraph;