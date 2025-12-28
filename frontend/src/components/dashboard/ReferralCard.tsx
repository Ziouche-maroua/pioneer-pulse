import { Users } from "lucide-react";
import { useReferral } from "@/hooks/useData";

const ReferralCard = () => {
  const { data: referral, isLoading } = useReferral();

  if (isLoading || !referral) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <h3 className="text-foreground font-semibold mb-4">Referral Tracking</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Invited</p>
            <p className="text-foreground font-semibold">{referral.invited} people</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-muted-foreground text-xs">Bonus</p>
          <p className="text-foreground font-semibold">{referral.bonus.toLocaleString()}</p>
        </div>
      </div>

      {/* Score Badge */}
      <div className="absolute top-6 right-6 w-16 h-16 rounded-full gradient-coral flex flex-col items-center justify-center glow-coral">
        <span className="text-primary-foreground text-xl font-bold">{referral.totalScore}</span>
        <span className="text-primary-foreground/80 text-[10px]">Total Score</span>
      </div>
    </div>
  );
};

export default ReferralCard;