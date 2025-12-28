import { Layers, MessageSquare, Zap } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Organize your campaigns",
    description: "Keep all your marketing campaigns organized in one place. Create, schedule, and monitor everything effortlessly."
  },
  {
    icon: MessageSquare,
    title: "Manage customers",
    description: "Build stronger relationships with your customers. Track interactions and personalize every touchpoint."
  },
  {
    icon: Zap,
    title: "Track progress fast",
    description: "Get real-time insights into your performance. Make data-driven decisions in seconds, not hours."
  }
];

const FeaturesOverview = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-elevated to-background opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:bg-card animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-rose flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
