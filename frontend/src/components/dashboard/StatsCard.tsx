import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon?: LucideIcon;
}

const StatsCard = ({ title, value, change, changeType = "positive", icon: Icon }: StatsCardProps) => {
  return (
    <div className="glass-card-hover p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-foreground text-2xl font-bold">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              changeType === "positive" ? "text-teal" : "text-destructive"
            )}>
              {changeType === "positive" ? "+" : ""}{change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl gradient-coral flex items-center justify-center glow-coral">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
