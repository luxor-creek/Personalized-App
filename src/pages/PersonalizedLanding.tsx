import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PersonalizedHeroSection from "@/components/PersonalizedHeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import AboutSection from "@/components/AboutSection";
import PortfolioStrip from "@/components/PortfolioStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { useTemplateContent } from "@/hooks/useTemplateContent";

interface PersonalizedPageData {
  id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  custom_message: string | null;
  template_id: string | null;
}

const PersonalizedLanding = () => {
  const { token } = useParams<{ token: string }>();
  const [pageData, setPageData] = useState<PersonalizedPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default to police-recruitment template for now
  const { template } = useTemplateContent("police-recruitment");

  useEffect(() => {
    const fetchPageData = async () => {
      if (!token) {
        setError("Invalid page link");
        setLoading(false);
        return;
      }

      try {
        // Fetch the personalized page data using security definer function
        const { data, error: fetchError } = await supabase
          .rpc("get_personalized_page_by_token", { lookup_token: token });

        if (fetchError || !data || data.length === 0) {
          setError("Page not found");
          setLoading(false);
          return;
        }

        const pageRecord = data[0];
        setPageData({
          id: pageRecord.id,
          first_name: pageRecord.first_name,
          last_name: pageRecord.last_name,
          company: pageRecord.company,
          custom_message: pageRecord.custom_message,
          template_id: pageRecord.template_id,
        });

        // Record the page view
        await supabase.from("page_views").insert({
          personalized_page_id: pageRecord.id,
          user_agent: navigator.userAgent,
        });
      } catch (err) {
        console.error("Error fetching page:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PersonalizedHeroSection 
        thumbnailUrl={template?.hero_video_thumbnail_url || heroThumbnail}
        firstName={pageData?.first_name}
        lastName={pageData?.last_name || undefined}
        company={pageData?.company || undefined}
        customMessage={pageData?.custom_message || undefined}
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

export default PersonalizedLanding;
