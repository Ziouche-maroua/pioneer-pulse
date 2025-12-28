import jellyfishBg from "@/assets/jellyfish-bg.jpg";

const ProfileWelcomeCard = () => {
  return (
    <div className="glass-card overflow-hidden relative h-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${jellyfishBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-end">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Nice to see you, Pichou</p>
        <a 
          href="/dashboard" 
          className="mt-4 text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
        >
          Check your Dashboard →
        </a>
      </div>
    </div>
  );
};

export default ProfileWelcomeCard;
