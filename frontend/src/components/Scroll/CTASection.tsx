import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Heart } from "lucide-react";
import ctaFlowers from "@/assets/cta-flowers.jpg";

const benefits = [
  { icon: Zap, text: "Easy Onboarding" },
  { icon: Shield, text: "Your Project Security" },
  { icon: Heart, text: "Best Your Website" }
];

const CTASection = () => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Content */}
            <div className="p-10 md:p-16 relative z-10">
              <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
                Why you should
                <br />
                <span className="text-gradient">choose us?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                With 20+ years of experience, you can expect to be in good hands through 
                every step. See the difference yourself when you start today.
              </p>
              
              {/* Benefits */}
              <div className="space-y-4 mb-10">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="default" size="lg" className="group">
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            {/* Image */}
            <div className="relative hidden lg:block">
              <img 
                src={ctaFlowers} 
                alt="Elegant white lilies" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

