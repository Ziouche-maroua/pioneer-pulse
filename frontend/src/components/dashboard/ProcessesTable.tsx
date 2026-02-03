
import { useProcesses, useLatestMetrics } from "@/hooks/useData";
import { Activity, Info } from "lucide-react";
import { useMemo } from "react";

const ProcessesTable = () => {
  const { data, isLoading } = useProcesses();
  const { data: metricsData } = useLatestMetrics();

  // Stable check - useMemo prevents flickering
  const hasProcesses = useMemo(() => {
    return data?.data && data.data.length > 0;
  }, [data]);

  const currentService = useMemo(() => {
    return metricsData?.data?.[0];
  }, [metricsData]);

  // Simple loading state
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Active Processes
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If no processes, show current service info instead
  if (!hasProcesses) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Active Processes
        </h3>
        
        <div className="py-8">
          {currentService ? (
            <div className="max-w-2xl mx-auto">
              {/* Service Card */}
              <div className="bg-muted/20 rounded-lg p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{currentService.service_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentService.service_id.slice(0, 16)}...
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium border border-green-500/50">
                    Active
                  </div>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-background/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">CPU Usage</p>
                    <p className="text-2xl font-bold text-green-500">{currentService.cpu_usage}%</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Memory</p>
                    <p className="text-2xl font-bold text-purple-500">{currentService.memory_usage}%</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Disk</p>
                    <p className="text-2xl font-bold text-blue-500">{currentService.disk_usage}%</p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Load Avg</p>
                    <p className="text-2xl font-bold text-orange-500">{currentService.load_avg.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-500 font-medium mb-1">No individual processes detected</p>
                  <p className="text-muted-foreground text-xs">
                    The producer tracks processes using &gt; 0.1% CPU. 
                    Run CPU-intensive tasks or wait for system activity to see process details here.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Info className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No service data available
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show processes table
  const processes = data.data;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Active Processes
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({processes.length})
          </span>
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                Process
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                PID
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">
                CPU %
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">
                Memory %
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                Service
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr
                key={process.serial_id}
                className="border-t border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-primary">
                    {process.process_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-muted-foreground">
                    {process.pid}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-green-500">
                    {process.cpu_usage.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-purple-500">
                    {process.memory_usage.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                    {process.service_name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          CPU &gt; 0.5% • Updates every 10s
        </p>
      </div>
    </div>
  );
};

export default ProcessesTable;