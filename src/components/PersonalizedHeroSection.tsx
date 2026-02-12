import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import { applyPersonalization } from "@/hooks/useTemplateContent";
import { renderFormattedText } from "@/lib/formatText";

interface PersonalizedHeroSectionProps {
  thumbnailUrl?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  customMessage?: string;
  logoUrl?: string | null;
  badge?: string;
  headline?: string;
  subheadline?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  videoId?: string;
  showHeaderCta?: boolean;
  showCtaSecondary?: boolean;
  onVideoPlay?: () => void;
  onLinkClick?: (label: string, url?: string) => void;
}

const PersonalizedHeroSection = ({ 
  thumbnailUrl, 
  firstName,
  lastName,
  company,
  customMessage,
  logoUrl,
  badge,
  headline,
  subheadline,
  ctaPrimaryText = "Get in Touch",
  ctaSecondaryText = "Learn More",
  videoId = "1153753885",
  showHeaderCta = true,
  showCtaSecondary = true,
  onVideoPlay,
  onLinkClick,
}: PersonalizedHeroSectionProps) => {
  const scrollToContact = () => {
    onLinkClick?.("Get in Touch CTA", "#contact");
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const personalizationData = {
    first_name: firstName,
    last_name: lastName || "",
    company: company,
    full_name: `${firstName || ""} ${lastName || ""}`.trim(),
  };

  const getBadge = () => {
    if (badge) return applyPersonalization(badge, personalizationData);
    return company ? `Prepared for ${company}` : "Police Recruitment Video Demo";
  };

  const getHeadline = () => {
    if (headline) return applyPersonalization(headline, personalizationData);
    if (firstName) return `${firstName}, here's our latest officer recruitment video for you to review.`;
    return "A recruitment video that actually helps your hiring pipeline.";
  };

  const getSubheadline = () => {
    if (customMessage) return customMessage;
    if (subheadline) return applyPersonalization(subheadline, personalizationData);
    if (company) return `We created this video specifically for ${company}. Watch how we help the right people self-select into the job.`;
    return "Watch how we create recruitment videos that help the right people self-select into the job.";
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
          {showHeaderCta && (
          <Button variant="heroOutline" size="lg" onClick={scrollToContact}>
            {ctaPrimaryText}
          </Button>
          )}
        </header>

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

        <div className="max-w-4xl mx-auto animate-fade-up-delay-2">
          <VideoPlayer videoId={videoId} thumbnailUrl={thumbnailUrl} onVideoPlay={onVideoPlay} />
        </div>

        {showCtaSecondary && (
        <div className="flex justify-center mt-12 lg:mt-16 animate-fade-up-delay-2">
          <button 
            onClick={() => {
              onLinkClick?.("Learn More CTA", "#about");
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="text-sm uppercase tracking-wider">{ctaSecondaryText}</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedHeroSection;
