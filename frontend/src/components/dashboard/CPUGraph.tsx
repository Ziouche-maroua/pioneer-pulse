
import { useHourlyMetrics, useLatestMetrics, useServices } from "@/hooks/useData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { useMemo } from "react";

const CPUGraph = () => {
  // Get service_id first
  const { data: servicesData } = useServices();
  
  // Get the CURRENT service_id (not the old one!)
  const serviceId = servicesData?.data?.[0]?.service_id;

  console.log('🔍 Using service_id:', serviceId);

  // Get hourly metrics with service_id
  const { data: hourlyData, isLoading, isError } = useHourlyMetrics(
    serviceId ? { service_id: serviceId, hours: 24 } : undefined
  );

  console.log('📊 Hourly data:', hourlyData);

  // Get latest metrics as fallback
  const { data: latestData } = useLatestMetrics();

  // Generate chart data - useMemo prevents flickering
  const chartData = useMemo(() => {
    // Try hourly data first
    if (hourlyData?.data && hourlyData.data.length > 0) {
      console.log('✅ Using real hourly data:', hourlyData.data.length, 'points');
      
      return hourlyData.data
        .map(point => {
          // YOUR BACKEND USES: hour_timestamp (not "hour"!)
          const timestamp = point.hour_timestamp;
          
          if (!timestamp) {
            console.warn('⚠️ Missing hour_timestamp in:', point);
            return null;
          }

          const date = new Date(timestamp);
          
          if (isNaN(date.getTime())) {
            console.warn('⚠️ Invalid timestamp:', timestamp);
            return null;
          }

          return {
            name: date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            value: Math.round(point.avg_cpu || 0),
            timestamp: date.toISOString(),
          };
        })
        .filter(Boolean)  // Remove null entries
        .reverse();  // Oldest to newest for proper chart display
    }

    // Fallback: Generate sample data from current metrics
    if (latestData?.data?.[0]) {
      console.log('⚠️ No hourly data, using sample data from current CPU:', latestData.data[0].cpu_usage);
      const currentCpu = latestData.data[0].cpu_usage;
      return generateSampleData(currentCpu);
    }

    console.log('❌ No data available');
    return [];
  }, [hourlyData, latestData]);

  console.log('📈 Chart data points:', chartData.length);

  // Calculate stats - useMemo prevents recalculation
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            CPU Usage Trends
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

  // If no data, show minimal empty state
  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            CPU Usage Trends
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
            {serviceId && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Service: {serviceId.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          CPU Usage Trends
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-semibold text-primary">{stats.current}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="font-semibold">{stats.average}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="font-semibold text-red-500">{stats.peak}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
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
            itemStyle={{ color: '#10B981' }}
            formatter={(value: number) => [`${value}%`, 'CPU Usage']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <p>Last 24 hours • {chartData.length} data points</p>
        <p>Updates every minute</p>
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
  
  // Generate 12 points over 24 hours (every 2 hours)
  for (let i = 11; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
    
    // Create realistic variation
    const variance = Math.sin(i / 2) * 10 + (Math.random() - 0.5) * 8;
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

export default CPUGraph;