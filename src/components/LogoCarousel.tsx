import { useEffect, useRef } from "react";

const logos = [
  "Austin PD",
  "Denver PD", 
  "Phoenix PD",
  "Seattle PD",
  "Miami PD",
  "Boston PD",
  "Portland PD",
  "Atlanta PD",
];

const LogoCarousel = () => {
  return (
    <section className="py-12 bg-secondary/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
          Trusted by public organizations nationwide
        </p>
        
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-secondary/30 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-secondary/30 to-transparent z-10" />
          
          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="px-6 py-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground font-medium whitespace-nowrap">
                    {logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
