import { 
  LayoutGrid, 
  Users, 
  Sparkles, 
  Video, 
  TrendingUp, 
  CreditCard 
} from "lucide-react";

const problems = [
  {
    icon: LayoutGrid,
    title: "Unlimited Projects",
    description: "Create and manage as many projects as you need. No limits, no restrictions."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Invite your team and collaborate in real-time. Everyone stays in sync."
  },
  {
    icon: Sparkles,
    title: "AI Powered",
    description: "Let AI handle the heavy lifting. Get smart suggestions and automations."
  },
  {
    icon: Video,
    title: "Video Meetings",
    description: "Built-in video conferencing for seamless communication with your team."
  },
  {
    icon: TrendingUp,
    title: "Free Tracking",
    description: "Track all your metrics without paying extra. Analytics included by default."
  },
  {
    icon: CreditCard,
    title: "Payment System",
    description: "Accept payments directly through the platform. Simple, secure, seamless."
  }
];

const ProblemSolving = () => {
  return (
    <section id="solutions" className="py-24 bg-surface-elevated/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            We made this app
            <br />
            <span className="text-gradient">to solve your problems.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your business, all in one place. 
            No more switching between dozens of tools.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div 
              key={problem.title}
              className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <problem.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolving;
