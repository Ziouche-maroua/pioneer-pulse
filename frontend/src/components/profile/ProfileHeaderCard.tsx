import { useState } from "react";
import { useProfile } from "@/hooks/useData";


const ProfileHeader = () => {
  
  const { data: profile, isLoading } = useProfile();


  if (isLoading || !profile) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
       
        <div>
          <h2 className="text-foreground font-semibold text-lg">{profile.name}</h2>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
        </div>
      </div>

     
    </div>
  );
};

export default ProfileHeader;
