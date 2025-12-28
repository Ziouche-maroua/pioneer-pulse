import { useSatisfaction } from "@/hooks/useData";

const SatisfactionCard = () => {
  const { data: satisfaction, isLoading } = useSatisfaction();

  if (isLoading || !satisfaction) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (satisfaction.percentage / 100) * circumference;

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h3 className="text-foreground font-semibold mb-1">Satisfaction Rate</h3>
      <p className="text-muted-foreground text-xs mb-4">{satisfaction.label}</p>
      
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--coral))" />
                <stop offset="100%" stopColor="hsl(var(--coral-light))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{satisfaction.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionCard;