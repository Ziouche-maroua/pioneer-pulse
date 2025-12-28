import { Phone, Mail, MapPin, Twitter, Facebook, Instagram } from "lucide-react";
import { useProfile } from "@/hooks/useData";

const ProfileInfoCard = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-foreground font-semibold text-lg mb-4">Profile Information</h3>
      
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        {profile.bio}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm w-24">Full Name:</span>
          <span className="text-foreground text-sm">{profile.fullName}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm w-24">Mobile:</span>
          <span className="text-foreground text-sm">{profile.mobile}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm w-24">Email:</span>
          <span className="text-foreground text-sm">{profile.email}</span>
        </div>

        
      </div>
    </div>
  );
};

export default ProfileInfoCard;
