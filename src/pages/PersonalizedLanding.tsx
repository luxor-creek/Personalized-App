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
import { useTemplateContentById, applyPersonalization } from "@/hooks/useTemplateContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import kickerLogo from "@/assets/kicker-logo.png";
import SampleRequestForm from "@/components/SampleRequestForm";
import { 
  Sparkles, 
  Calendar, 
  PlayCircle, 
  Play, 
  Phone, 
  Quote,
  CheckCircle2,
  Film,
  X,
  Check,
  ArrowRight
} from "lucide-react";

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
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  
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

  // Set template slug once template is loaded
  useEffect(() => {
    if (template?.slug) {
      setTemplateSlug(template.slug);
    }
  }, [template]);

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

  // Render Wine Video Template
  if (templateSlug === "wine-video") {
    const scrollToForm = () => {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const defaultPortfolioVideos = [
      { title: "Product overview", videoId: "1084786498" },
      { title: "Brand story", videoId: "1084786498" },
      { title: "Event/trade show", videoId: "1084786498" },
    ];

    const portfolioVideos = template?.portfolio_videos?.length 
      ? template.portfolio_videos 
      : defaultPortfolioVideos;

    const portfolioSectionTitle = template?.testimonials_subtitle || "Other Examples";
    const portfolioSectionDescription = template?.portfolio_strip_url || "Here are a few other videos our automated system produced using only the product webpage URL's. Scripted, voiced, and edited in less than an hour.";

    const firstName = pageData?.first_name || "there";
    const companyName = pageData?.company || "your company";

    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        {/* Header */}
        <header className="py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={kickerLogo} alt="Kicker Video" className="h-8" />
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-foreground">{companyName}</span>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={scrollToForm}>
            <Phone className="w-4 h-4" />
            Contact Us
          </Button>
        </header>

        {/* Hero Section */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 md:p-12 bg-white rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {applyPersonalization(template?.hero_badge || "Personalized for {{company}}", personalizationData)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                    {applyPersonalization(template?.hero_headline || `Hi {{first_name}}, you're going to love the proposal we have for {{company}}.`, personalizationData)}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    {applyPersonalization(template?.hero_subheadline || "", personalizationData)}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={scrollToForm}>
                      <Calendar className="w-4 h-4" />
                      {template?.hero_cta_primary_text || "Contact Us"}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      {template?.hero_cta_secondary_text || "See portfolio"}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-primary">
                    <img 
                      src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=450&fit=crop"
                      alt="Wine video production"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    <span className="text-amber-500 font-medium">{firstName}</span>, take a look at this video demo.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Simple Video Production Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {template?.features_title || "Simple Video Production"}
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              {template?.features_subtitle || "We turn your existing wine product pages into short, elegant videos that highlight each bottle, then prepare those videos for modern discovery across search, social, and video platforms."}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white text-center">
                <div className="text-2xl font-bold text-foreground mb-2">No Filming</div>
                <p className="text-muted-foreground">No camera crews</p>
              </Card>
              <Card className="p-6 bg-white text-center">
                <div className="text-2xl font-bold text-foreground mb-2">No Scriptwriting</div>
                <p className="text-muted-foreground">Content comes from your pages</p>
              </Card>
              <Card className="p-6 bg-white text-center">
                <div className="text-2xl font-bold text-foreground mb-2">No Delay</div>
                <p className="text-muted-foreground">Fast Turnaround</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              {template?.about_content || "A simple process built for busy wine marketers"}
            </h2>

            <div className="grid md:grid-cols-5 gap-6">
              {[
                { number: 1, title: "Send URLs", description: "Send the URL's of each product. This can be links or a csv spreadsheet." },
                { number: 2, title: "Template", description: "We create the branded template for your approval and revisions." },
                { number: 3, title: "Production", description: "We produce all videos within 2-3 days." },
                { number: 4, title: "Review", description: "You review them." },
                { number: 5, title: "Delivery", description: "Delivery to you." },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white text-xl font-bold flex items-center justify-center mx-auto">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Work Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {portfolioSectionTitle}
              </h2>
              <Button variant="link" className="gap-2 text-primary p-0">
                Request a tailored reel
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
              {portfolioSectionDescription}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {portfolioVideos.map((item, index) => (
                <Card key={index} className="overflow-hidden group">
                  <div className="relative aspect-video bg-black">
                    <iframe
                      src={`https://player.vimeo.com/video/${item.videoId || "1084786498"}?badge=0&autopause=0&player_id=0&app_id=58479`}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      className="absolute inset-0 w-full h-full"
                      title={item.title}
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <p className="font-medium text-foreground">{item.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
              {applyPersonalization(template?.testimonials_title || "What teams like {{company}} say", personalizationData)}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Kicker made complex messaging simple and engaging. Fast, on-budget, and on-brand.",
                "Smooth process from brief to delivery. Their team felt like an extension of ours.",
                "The videos moved the needle on demos and deal velocity. Highly recommend.",
              ].map((quote, index) => (
                <Card key={index} className="p-6 bg-gray-50 border-0">
                  <Quote className="w-6 h-6 text-amber-500 mb-4" />
                  <p className="text-foreground leading-relaxed">"{quote}"</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                  THE PROBLEM
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Why Viaxo Exists
                </h2>
                <div className="space-y-4">
                  {[
                    "Traditional video production doesn't scale",
                    "Static pages underperform in engagement",
                    "Search and AI discovery prioritize video",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="p-8 bg-white border border-gray-200">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-4">
                  THE SOLUTION
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Infrastructure for Practical Video at Scale
                </h3>
                <p className="text-muted-foreground mb-6">
                  Viaxo provides infrastructure that makes video practical across entire catalogs and campaigns.
                </p>
                <div className="space-y-3">
                  {[
                    "Automated generation from existing content",
                    "Template-driven consistency",
                    "Bulk processing capability",
                    "White-label delivery",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {template?.pricing_title || "Want something more custom?"}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {template?.pricing_subtitle || "Project-based pricing with options for scope. Social clips can start under $1k; multi-location shoots may exceed $10k."}
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Transparent estimates before kickoff",
                    "21-city crew network, minimal travel costs",
                    "Live action, animation, or hybrid",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get a tailored quote
                  </Button>
                  <Button variant="outline" className="gap-2">
                    See more work
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"
                  alt="Industrial production"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-primary to-primary/80">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Let's work together, <span className="text-amber-200">{firstName}</span>
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              We're excited to show {companyName} what's possible. Get started in minutes.
            </p>
          </div>
        </section>

        <SampleRequestForm />

        {/* Final CTA Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {applyPersonalization(template?.contact_title || "Let's make {{company}} the obvious choice", personalizationData)}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {applyPersonalization(template?.contact_subtitle || "Book a quick brainstorm with a senior producer. We'll scope ideas, timelines, and budget in one call.", personalizationData)}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={scrollToForm}>
                <Phone className="w-4 h-4" />
                Contact Us
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Film className="w-4 h-4" />
                Request reel
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 bg-gray-50 border-t">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={kickerLogo} alt="Kicker Video" className="h-6" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Kicker Video. Professional video production.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We collect anonymous analytics to improve our service.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Default: Police Recruitment Template (or B2B Demo - they use similar components)
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