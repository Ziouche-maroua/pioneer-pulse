import { Cpu } from "lucide-react";
import { useProcesses } from "@/hooks/useData";
import type { Process } from "@/data/mockData";

const ProcessesTable = () => {
  const { data: processes, isLoading } = useProcesses();

  if (isLoading) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.9s" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-foreground font-semibold">Running Processes</h3>
          <p className="text-muted-foreground text-xs">Live CPU and memory usage</p>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Cpu className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="pb-4 font-medium">Process Name</th>
              <th className="pb-4 font-medium">PID</th>
              <th className="pb-4 font-medium">CPU Usage</th>
              <th className="pb-4 font-medium">Memory Usage</th>
              <th className="pb-4 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {processes?.map((process: Process) => (
              <tr key={process.serial_id} className="border-t border-border/30">
                <td className="py-4">
                  <span className="text-foreground font-medium">{process.process_name}</span>
                </td>
                <td className="py-4 text-muted-foreground">{process.pid}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-20"
                    >
                      <div 
                        className="h-full gradient-coral rounded-full" 
                        style={{ width: `${process.cpu_usage}%`}} 
                      />
                    </div>
                    <span className="text-foreground text-xs font-medium w-8">{process.cpu_usage.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="py-4">
                <div className="flex items-center gap-2">
                    <div 
                      className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-20"
                    >
                      <div 
                        className="h-full bg-teal rounded-full" 
                        style={{ width: `${process.memory_usage}%`}} 
                      />
                    </div>
                    <span className="text-foreground text-xs font-medium w-8">{process.memory_usage.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="py-4 text-muted-foreground">
                  {new Date(process.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessesTable;
