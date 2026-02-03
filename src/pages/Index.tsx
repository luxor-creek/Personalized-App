import HeroSection from "@/components/HeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import AboutSection from "@/components/AboutSection";
import PortfolioStrip from "@/components/PortfolioStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { useTemplateContent } from "@/hooks/useTemplateContent";

const Index = () => {
  const { template, loading } = useTemplateContent("police-recruitment");

  // Show a minimal loading state or just render with defaults
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        thumbnailUrl={template?.hero_video_thumbnail_url || heroThumbnail}
        badge={template?.hero_badge || undefined}
        headline={template?.hero_headline || undefined}
        subheadline={template?.hero_subheadline || undefined}
        ctaPrimaryText={template?.hero_cta_primary_text || undefined}
        ctaSecondaryText={template?.hero_cta_secondary_text || undefined}
        videoId={template?.hero_video_id || undefined}
      />
      <LogoCarousel />
      <AboutSection />
      <PortfolioStrip />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
