import { Search, Bell, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  pageTitle?: string;
  breadcrumb?: string;
}

const Header = ({ pageTitle = "Dashboard", breadcrumb = "Dashboard" }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">{breadcrumb}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type here..."
            className="w-48 pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <button 
          onClick={() => navigate("/profile")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default Header;
