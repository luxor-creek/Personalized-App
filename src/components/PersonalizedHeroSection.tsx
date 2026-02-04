import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import kickerLogo from "@/assets/kicker-logo.png";
import { applyPersonalization } from "@/hooks/useTemplateContent";
import { renderFormattedText } from "@/lib/formatText";

interface PersonalizedHeroSectionProps {
  thumbnailUrl?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  customMessage?: string;
  // Template content props
  badge?: string;
  headline?: string;
  subheadline?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  videoId?: string;
}

const PersonalizedHeroSection = ({ 
  thumbnailUrl, 
  firstName,
  lastName,
  company,
  customMessage,
  badge,
  headline,
  subheadline,
  ctaPrimaryText = "Get in Touch",
  ctaSecondaryText = "Learn More",
  videoId = "1153753885"
}: PersonalizedHeroSectionProps) => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  // Personalization data
  const personalizationData = {
    first_name: firstName,
    last_name: lastName || "",
    company: company,
    full_name: `${firstName || ""} ${lastName || ""}`.trim(),
  };

  // Apply personalization to template content or use custom logic
  const getBadge = () => {
    if (badge) {
      return applyPersonalization(badge, personalizationData);
    }
    return company ? `Prepared for ${company}` : "Police Recruitment Video Demo";
  };

  const getHeadline = () => {
    if (headline) {
      return applyPersonalization(headline, personalizationData);
    }
    // Default personalized headline
    if (firstName) {
      return `${firstName}, here's our latest officer recruitment video for you to review.`;
    }
    return "A recruitment video that actually helps your hiring pipeline.";
  };

  const getSubheadline = () => {
    if (customMessage) {
      return customMessage;
    }
    if (subheadline) {
      return applyPersonalization(subheadline, personalizationData);
    }
    if (company) {
      return `We created this video specifically for ${company}. Watch how we help the right people self-select into the job.`;
    }
    return "Watch how we create recruitment videos that help the right people self-select into the job.";
  };

  return (
    <section className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(43 74% 49%) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 lg:mb-16 animate-fade-up">
          <img src={kickerLogo} alt="Kicker Video" className="h-8 md:h-10" />
          <Button variant="heroOutline" size="lg" onClick={scrollToContact}>
            {ctaPrimaryText}
          </Button>
        </header>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto text-center mb-12 lg:mb-16">
          <p className="text-primary font-medium tracking-wider uppercase mb-4 animate-fade-up">
            {renderFormattedText(getBadge())}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up-delay leading-tight">
            {renderFormattedText(getHeadline())}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-2">
            {renderFormattedText(getSubheadline())}
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-4xl mx-auto animate-fade-up-delay-2">
          <VideoPlayer videoId={videoId} thumbnailUrl={thumbnailUrl} />
        </div>

        {/* Scroll indicator */}
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

export default PersonalizedHeroSection;
