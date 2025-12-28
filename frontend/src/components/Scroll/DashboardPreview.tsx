import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const benefits = [
  "Real-time analytics dashboard",
  "Custom report builder",
  "Automated insights & alerts",
  "Team collaboration tools"
];

const DashboardPreview = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Dashboard Image */}
          <div className="relative animate-fade-up order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-50" />
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
              <img 
                src={dashboardPreview} 
                alt="Analytics Dashboard Preview" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-xl p-4 shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-rose flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">↑</span>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-foreground">+247%</p>
                  <p className="text-sm text-muted-foreground">Conversion rate</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="order-1 lg:order-2 animate-fade-up animation-delay-200">
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
              Track your progress with
              <br />
              <span className="text-gradient">our advanced site.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Gain complete visibility into your marketing performance. Our intuitive dashboard 
              gives you the insights you need to make smarter decisions and grow faster.
            </p>
            
            {/* Benefits List */}
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button variant="default" size="lg" className="group">
              Explore Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;

