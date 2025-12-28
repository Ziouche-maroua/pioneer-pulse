import jellyfishBg from "@/assets/jellyfish-bg.jpg";
import { useWelcome } from "@/hooks/useData";

const WelcomeCard = () => {
  const { data: welcome, isLoading } = useWelcome();

  if (isLoading) {
    return (
      <div className="glass-card h-48 animate-pulse">
        <div className="h-full bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div 
      className="glass-card relative overflow-hidden h-48 animate-fade-in"
      style={{ animationDelay: "0.2s" }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${jellyfishBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-card/70 to-transparent" />
      <div className="relative z-10 p-6 h-full flex flex-col justify-center">
        <p className="text-muted-foreground text-sm mb-1">Welcome back,</p>
        <h2 className="text-foreground text-2xl font-bold mb-1">{welcome?.userName}</h2>
        <p className="text-muted-foreground text-sm">{welcome?.greeting}</p>
        <button className="mt-4 text-sm text-primary hover:text-coral-light transition-colors font-medium">
          Tap to record →
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;