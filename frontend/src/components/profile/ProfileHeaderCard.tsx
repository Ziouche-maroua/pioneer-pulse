import { useAuth } from "@/contexts/AuthContext";

const ProfileHeader = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div>
          <h2 className="text-foreground font-semibold text-lg">{user.username}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;