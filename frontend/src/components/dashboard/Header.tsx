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
        
        {/* Actions */}
        <button 
          onClick={() => navigate("/profile")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
        
      </div>
    </header>
  );
};

export default Header;
