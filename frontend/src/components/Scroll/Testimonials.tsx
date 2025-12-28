import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "TechFlow Inc.",
    content: "This platform completely transformed how we approach our marketing campaigns. The analytics are incredibly insightful and the interface is a joy to use.",
    avatar: "SM"
  },
  {
    name: "James Rodriguez",
    role: "Founder & CEO",
    company: "Growth Labs",
    content: "We've tried countless tools, but nothing compares to this. The AI-powered insights have helped us increase our conversion rates by over 300%.",
    avatar: "JR"
  },
  {
    name: "Emily Chen",
    role: "Head of Growth",
    company: "Startup Studio",
    content: "Finally, a tool that actually delivers on its promises. Our team productivity has skyrocketed since we started using this platform.",
    avatar: "EC"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-primary font-medium mb-4">Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium">
            1,245 remote teams have shared their
            <br />
            <span className="text-gradient">experience with our app.</span>
          </h2>
        </div>
        
        {/* Testimonials */}
        <div className="max-w-4xl mx-auto space-y-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="group p-6 md:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-rose flex items-center justify-center">
                    <span className="text-primary-foreground font-serif font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground text-lg leading-relaxed mb-4">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
