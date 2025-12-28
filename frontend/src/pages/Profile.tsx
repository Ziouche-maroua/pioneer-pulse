import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import ProfileWelcomeCard from "@/components/profile/ProfileWelcomeCard";
import ActivityStatusCard from "@/components/profile/ActivityStatusCard";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import jellyfishBg from "@/assets/jellyfish-bg.jpg";

const Profile = () => {
  document.documentElement.classList.add('dark');
  
  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${jellyfishBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 pointer-events-none" />

      {/* Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto relative z-10">
        <Header pageTitle="Profile" breadcrumb="Profile" />

        {/* Profile Header */}
        <ProfileHeaderCard />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:row-span-1">
            <ProfileWelcomeCard />
          </div>

          {/* Activity Status */}
          <div className="lg:col-span-1">
            <ActivityStatusCard />
          </div>

          {/* Profile Info */}
          <div className="lg:col-span-1">
            <ProfileInfoCard />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2025, Made with ❤️ by Pioneer Team</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Marketplace</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
            <a href="#" className="hover:text-foreground transition-colors">License</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Profile;
