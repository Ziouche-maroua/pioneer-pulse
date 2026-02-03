
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * StatsCard - Reusable card for displaying metrics
 * 
 * Usage:
 * <StatsCard
 *   title="CPU Usage"
 *   value="45%"
 *   subtitle="Across all services"
 *   icon={Cpu}
 *   trend={{ value: "5% increase", isPositive: false }}
 * />
 */
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className 
}: StatsCardProps) => {
  return (
    <div className={cn(
      "glass-card-hover p-5 flex items-start justify-between group",
      className
    )}>
      {/* Left side: Text content */}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Icon */}
      <div className="ml-4 p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  );
};

export default StatsCard;
