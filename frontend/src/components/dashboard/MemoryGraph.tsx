import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useMemoryGraphData } from "@/hooks/useData";

const MemoryGraph = () => {
  const { data: graphData, isLoading } = useMemoryGraphData();

  if (isLoading) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
      <div className="mb-4">
        <h3 className="text-foreground font-semibold">Memory Graph</h3>
        <p className="text-muted-foreground text-xs">RAM Usage History</p>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={graphData} barGap={4}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(260, 15%, 12%)', 
                border: '1px solid hsl(260, 15%, 20%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 98%)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(0, 85%, 70%)" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MemoryGraph;