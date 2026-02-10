import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import { supabase } from "@/integrations/supabase/client";
import PersonalizedHeroSection from "@/components/PersonalizedHeroSection";
import SectionRenderer from "@/components/builder/SectionRenderer";
import WineVideoPage from "@/pages/wine/WineVideoPage";
import LogoCarousel from "@/components/LogoCarousel";
import AboutSection from "@/components/AboutSection";
import PortfolioStrip from "@/components/PortfolioStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { useTemplateContentById, applyPersonalization } from "@/hooks/useTemplateContent";

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
  
  
  // Fetch template by ID once we have pageData
  const { template, loading: templateLoading } = useTemplateContentById(pageData?.template_id || null);

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


  if (loading || templateLoading) {
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

  const personalizationData = {
    first_name: pageData?.first_name || "",
    last_name: pageData?.last_name || "",
    company: pageData?.company || "",
    full_name: `${pageData?.first_name || ""} ${pageData?.last_name || ""}`.trim(),
  };

  // Render builder template if applicable
  if (template?.is_builder_template && Array.isArray(template.sections) && template.sections.length > 0) {
    return (
      <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen bg-white">
        {template.sections.map((section: any) => (
          <SectionRenderer
            key={section.id}
            section={section}
            isPreview={true}
            personalization={personalizationData}
          />
        ))}
      </TemplateAccentProvider>
    );
  }

  if (template?.slug?.startsWith("wine-video")) {
    return (
      <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen">
        <WineVideoPage template={template} personalization={personalizationData} />
      </TemplateAccentProvider>
    );
  }

  // Default: Police Recruitment Template (or B2B Demo - they use similar components)
  const policeVis = template?.personalization_config || {};
  const isPoliceVisible = (key: string) => policeVis[key] !== false;

  return (
    <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen bg-background">
      <PersonalizedHeroSection 
        thumbnailUrl={template?.hero_video_thumbnail_url || heroThumbnail}
        firstName={pageData?.first_name}
        lastName={pageData?.last_name || undefined}
        company={pageData?.company || undefined}
        customMessage={pageData?.custom_message || undefined}
        logoUrl={template?.logo_url}
        badge={template?.hero_badge || undefined}
        headline={template?.hero_headline || undefined}
        subheadline={template?.hero_subheadline || undefined}
        ctaPrimaryText={template?.hero_cta_primary_text || undefined}
        ctaSecondaryText={template?.hero_cta_secondary_text || undefined}
        videoId={template?.hero_video_id || undefined}
        showHeaderCta={isPoliceVisible("show_header_cta")}
        showCtaSecondary={isPoliceVisible("show_hero_cta_secondary")}
      />
      {isPoliceVisible("show_trust") && (
        <LogoCarousel 
          imageUrl={template?.client_logos_url || undefined}
          title={template?.cta_banner_subtitle ? applyPersonalization(template.cta_banner_subtitle, personalizationData) : undefined}
        />
      )}
      {isPoliceVisible("show_about") && (
        <AboutSection 
          title={template?.features_title ? applyPersonalization(template.features_title, personalizationData) : undefined}
          content={template?.about_content ? applyPersonalization(template.about_content, personalizationData) : undefined}
        />
      )}
      {isPoliceVisible("show_portfolio_strip") && (
        <PortfolioStrip 
          imageUrl={template?.portfolio_strip_url || undefined}
        />
      )}
      {isPoliceVisible("show_contact") && (
        <CTASection 
          title={template?.contact_title ? applyPersonalization(template.contact_title, personalizationData) : undefined}
          subtitle={template?.contact_subtitle ? applyPersonalization(template.contact_subtitle, personalizationData) : undefined}
          contactEmail={template?.contact_email || undefined}
          showPrimaryButton={isPoliceVisible("show_contact_cta_primary")}
          showSecondaryButton={isPoliceVisible("show_contact_cta_secondary")}
        />
      )}
      <Footer logoUrl={template?.logo_url} />
    </TemplateAccentProvider>
  );
};

export default PersonalizedLanding;