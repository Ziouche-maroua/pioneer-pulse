import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-rose flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-lg">P</span>
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Primrose</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
          <Button variant="default" size="sm" className="group">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
