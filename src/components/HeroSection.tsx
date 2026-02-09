import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import { renderFormattedText } from "@/lib/formatText";

interface HeroSectionProps {
  thumbnailUrl?: string;
  logoUrl?: string | null;
  badge?: string;
  headline?: string;
  subheadline?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  videoId?: string;
}

const HeroSection = ({ 
  thumbnailUrl,
  logoUrl,
  badge = "Police Recruitment Video Demo",
  headline = "A recruitment video that actually helps your hiring pipeline.",
  subheadline = "Watch how we create recruitment videos that help the right people self-select into the job.",
  ctaPrimaryText = "Get in Touch",
  ctaSecondaryText = "Learn More",
  videoId = "1153753885"
}: HeroSectionProps) => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderHeadline = () => {
    if (headline.includes("hiring pipeline")) {
      const parts = headline.split("hiring pipeline");
      return (
        <>
          {renderFormattedText(parts[0])}
          <span className="text-gradient">hiring pipeline.</span>
          {parts[1]?.replace(".", "") && renderFormattedText(parts[1].replace(".", ""))}
        </>
      );
    }
    return renderFormattedText(headline);
  };

  return (
    <section className="min-h-screen hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
        <header className="flex items-center justify-between mb-12 lg:mb-16 animate-fade-up">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 md:h-10 object-contain" />
          ) : (
            <div />
          )}
          <Button variant="heroOutline" size="lg" onClick={scrollToContact}>
            {ctaPrimaryText}
          </Button>
        </header>

        <div className="max-w-5xl mx-auto text-center mb-12 lg:mb-16">
          <p className="text-primary font-medium tracking-wider uppercase mb-4 animate-fade-up">
            {renderFormattedText(badge)}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up-delay leading-tight">
            {renderHeadline()}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-2">
            {renderFormattedText(subheadline)}
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-fade-up-delay-2">
          <VideoPlayer videoId={videoId} thumbnailUrl={thumbnailUrl} />
        </div>

        <div className="flex justify-center mt-12 lg:mt-16 animate-fade-up-delay-2">
          <button 
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="text-sm uppercase tracking-wider">{ctaSecondaryText}</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
