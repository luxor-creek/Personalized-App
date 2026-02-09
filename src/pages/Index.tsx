import HeroSection from "@/components/HeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import AboutSection from "@/components/AboutSection";
import PortfolioStrip from "@/components/PortfolioStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { useTemplateContent } from "@/hooks/useTemplateContent";

const Index = () => {
  const { template, loading } = useTemplateContent("police-recruitment");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen bg-background">
      <HeroSection 
        thumbnailUrl={template?.hero_video_thumbnail_url || heroThumbnail}
        badge={template?.hero_badge || undefined}
        headline={template?.hero_headline || undefined}
        subheadline={template?.hero_subheadline || undefined}
        ctaPrimaryText={template?.hero_cta_primary_text || undefined}
        ctaSecondaryText={template?.hero_cta_secondary_text || undefined}
        videoId={template?.hero_video_id || undefined}
      />
      <LogoCarousel 
        imageUrl={template?.client_logos_url || undefined}
      />
      <AboutSection 
        title={template?.features_title || undefined}
        content={template?.about_content || undefined}
      />
      <PortfolioStrip 
        imageUrl={template?.portfolio_strip_url || undefined}
      />
      <CTASection 
        title={template?.contact_title || undefined}
        subtitle={template?.contact_subtitle || undefined}
        contactEmail={template?.contact_email || undefined}
      />
      <Footer />
    </TemplateAccentProvider>
  );
};

export default Index;
