import { LayoutDashboard, User, LogOut, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Main navigation items
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  ];

  // Account items (dynamic based on auth state)
  const accountItems: NavItem[] = [
    { icon: User, label: "Profile", href: "/profile" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: logout,
      variant: 'danger'
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-coral flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span className="text-foreground font-semibold text-lg">Pioneer</span>
          <span className="text-muted-foreground text-xs">PULSE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.label} item={item} currentPath={location.pathname} />
          ))}
        </div>

        {/* Account Section */}
        <div className="mt-8">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Account
          </p>
          {/* User info */}
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
            </div>
          )}
          <div className="space-y-1">
            {accountItems.map((item) => (
              <NavButton key={item.label} item={item} currentPath={location.pathname} />
            ))}
          </div>
        </div>
      </nav>

      {/* Help Card */}
      <div className="p-4">
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-coral opacity-20" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-foreground font-medium text-sm mb-1">Need help?</p>
            <p className="text-muted-foreground text-xs mb-3">Check documentation</p>
            <a 
              href="https://github.com/Ziouche-maroua/pioneer-pulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full p-3 rounded-lg gradient-coral text-primary-foreground text-xs font-medium transition-all hover:opacity-90 text-center"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavButton = ({ item, currentPath }: { item: NavItem; currentPath: string }) => {
  const Icon = item.icon;
  const navigate = useNavigate();
  const isActive = item.href === currentPath;
  const isDanger = item.variant === 'danger';
  
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isDanger
          ? "text-red-500 hover:bg-red-500/10 hover:text-red-600"
          : isActive
          ? "bg-sidebar-accent text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5", 
        isActive && !isDanger && "text-primary",
        isDanger && "text-red-500"
      )} />
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
          {item.badge}
        </span>
      )}
    </button>
  );
};

export default Sidebar;