import { useState } from "react";
import { useProfile } from "@/hooks/useData";

type Tab = "overview" | "teams" | "projects";

const ProfileHeader = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: profile, isLoading } = useProfile();

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "OVERVIEW" },
    { id: "teams", label: "TEAMS" },
    { id: "projects", label: "PROJECTS" },
  ];

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
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div>
          <h2 className="text-foreground font-semibold text-lg">{profile.name}</h2>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
