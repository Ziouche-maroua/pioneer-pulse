import { Mail, Calendar, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProfileInfoCard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  // Format date
  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-foreground font-semibold text-lg mb-4">Profile Information</h3>
      
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        System administrator account for Pioneer Pulse monitoring platform.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-foreground text-sm font-medium">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-foreground text-sm font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-foreground text-sm font-medium">{joinedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;