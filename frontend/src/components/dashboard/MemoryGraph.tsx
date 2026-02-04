
import { useHourlyMetrics, useLatestMetrics, useServices } from "@/hooks/useData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MemoryStick, TrendingUp } from "lucide-react";
import { useMemo } from "react";

const MemoryGraph = () => {
  // Get service_id first
  const { data: servicesData } = useServices();
  const serviceId = servicesData?.data?.[0]?.service_id;

  // Get hourly metrics with service_id
  const { data: hourlyData, isLoading } = useHourlyMetrics(
    serviceId ? { service_id: serviceId, hours: 24 } : undefined
  );

  // Get latest metrics as fallback
  const { data: latestData } = useLatestMetrics();

  // Generate chart data - useMemo prevents flickering
  const chartData = useMemo(() => {
    // Try hourly data first
    if (hourlyData?.data && hourlyData.data.length > 0) {
      return hourlyData.data
        .map(point => {
          // YOUR BACKEND USES: hour_timestamp (not "hour"!)
          const timestamp = point.hour_timestamp;
          
          if (!timestamp) return null;

          const date = new Date(timestamp);
          if (isNaN(date.getTime())) return null;

          return {
            name: date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            value: Math.round(point.avg_memory || 0),
            timestamp: date.toISOString(),
          };
        })
        .filter(Boolean)  // Remove null entries
        .reverse();  // Oldest to newest
    }

    // Fallback: Generate sample data from current metrics
    if (latestData?.data?.[0]) {
      const currentMemory = latestData.data[0].memory_usage;
      return generateSampleData(currentMemory);
    }

    return [];
  }, [hourlyData, latestData]);

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { current: 0, average: 0, peak: 0 };
    }

    const values = chartData.map(d => d.value);
    return {
      current: values[values.length - 1] || 0,
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      peak: Math.max(...values),
    };
  }, [chartData]);

  // Handle loading
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex flex-col mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Memory Trends
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex flex-col mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Memory Trends
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Collecting trend data...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Charts will appear after a few minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header with stats */}
      <div className="flex flex-col mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <MemoryStick className="h-5 w-5" />
          Memory Trends
        </h3>
        <div className="flex items-center justify-around text-sm">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-semibold text-primary text-lg">{stats.current}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="font-semibold text-lg">{stats.average}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="font-semibold text-lg text-red-500">{stats.peak}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#8B5CF6' }}
            formatter={(value: number) => [`${value}%`, 'Memory']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#8B5CF6' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <p>{chartData.length} data points</p>
        <p>Last 24h</p>
      </div>
    </div>
  );
};

/**
 * Generate sample data when backend doesn't have enough historical data yet
 */
function generateSampleData(currentValue: number): Array<{ name: string; value: number; timestamp: string }> {
  const now = new Date();
  const data = [];
  
  // Generate 9 points over 24 hours (every 3 hours)
  for (let i = 8; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
    
    // Create realistic variation
    const variance = Math.sin(i / 1.5) * 8 + (Math.random() - 0.5) * 6;
    const value = Math.max(0, Math.min(100, currentValue + variance));
    
    data.push({
      name: timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      value: Math.round(value),
      timestamp: timestamp.toISOString(),
    });
  }
  
  return data;
}

export default MemoryGraph;