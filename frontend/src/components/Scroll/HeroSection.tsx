import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroFlowers from "@/assets/hero-flowers.jpg";

const partners = [
  "HubSpot", "Salesforce", "Zendesk", "Intercom", "Drift", "Mailchimp"
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroFlowers} 
          alt="Beautiful lily flowers" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute inset-0 bg-glow opacity-50" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center pt-16 md:pt-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Now with AI-powered insights</span>
          </div>
          
          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-6 animate-fade-up animation-delay-200">
            Get more visitors,
            <br />
            <span className="text-gradient">get more sales.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-400">
            Transform your marketing with powerful analytics and insights. 
            Track, optimize, and grow your business with our all-in-one platform.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animation-delay-600">
            <Button variant="default" size="lg" className="group w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="group w-full sm:w-auto">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Partner Logos */}
          <div className="animate-fade-up animation-delay-600">
            <p className="text-sm text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              {partners.map((partner) => (
                <span 
                  key={partner} 
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
