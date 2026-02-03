import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import EditorSidebar from "@/components/editor/EditorSidebar";
import EditableText from "@/components/editor/EditableText";
import EditableVideo from "@/components/editor/EditableVideo";
import EditableImage from "@/components/editor/EditableImage";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import kickerLogo from "@/assets/kicker-logo.png";
import clientLogos from "@/assets/client-logos.png";
import portfolioStrip from "@/assets/portfolio-strip.png";
import { ArrowDown, Play, DollarSign, Mail, ExternalLink } from "lucide-react";

const DEFAULT_ABOUT_CONTENT = `Most police recruitment videos aren't broken.
They're just outdated.

They were made for a time when interest was high and competition was low. Today, recruits are more cautious, more informed, and quicker to walk away if something feels unrealistic or unclear.

We see the same pattern again and again.
Departments invest in a video that looks professional, but doesn't answer the questions candidates are really asking. The result. Fewer qualified applicants and more drop-off later in the process.

**Kicker builds recruitment videos with one goal.**
**Help the right people self-select into the job.**

That means showing the work honestly. Letting officers speak in their own words. Being clear about expectations, career paths, and what the job actually demands.

We recently wrapped a recruitment video for the Pittsburgh Police Department using this approach. The department saw stronger engagement and better-fit applicants because the video did its job early in the funnel.

If your current recruitment video is more than a few years old, it's worth asking a simple question.
*Is it helping your pipeline. Or quietly hurting it.*`;

const TemplateEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    template,
    loading,
    saving,
    error,
    hasChanges,
    updateField,
    saveChanges,
    discardChanges,
  } = useTemplateEditor(slug);

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      // Stay on page to allow more edits
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/admin");
      }
    } else {
      navigate("/admin");
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    if (template?.slug === "police-recruitment") {
      window.open("/", "_blank");
    } else if (template?.slug === "b2b-demo") {
      window.open("/b2b-demo", "_blank");
    }
  };

  const handleInsertToken = (token: string) => {
    toast({
      title: "Token copied!",
      description: `${token} copied to clipboard. Paste it into any text field.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The requested template does not exist."}</p>
          <Button onClick={() => navigate("/admin")}>Back to Admin</Button>
        </div>
      </div>
    );
  }


  // B2B Demo template
  if (template.slug === "b2b-demo") {
    return (
      <div className="min-h-screen bg-white">
        {/* Sidebar */}
        <EditorSidebar
          templateName={template.name}
          hasChanges={hasChanges}
          isSaving={saving}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
          onInsertToken={handleInsertToken}
        />

        {/* Main content - with right margin for sidebar */}
        <div className="mr-80">
          {/* Hero Section */}
          <section className="pt-24 pb-16 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 rounded-full text-amber-800 text-sm font-medium mb-8">
                  <RichTextEditor
                    value={template.hero_badge || ""}
                    onChange={(value) => updateField("hero_badge", value)}
                    fieldName="Hero Badge"
                    supportsPersonalization
                    isHeadline
                  />
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <RichTextEditor
                    value={template.hero_headline}
                    onChange={(value) => updateField("hero_headline", value)}
                    fieldName="Hero Headline"
                    supportsPersonalization
                    isHeadline
                  />
                </h1>

                {/* Subheadline */}
                <div className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  <RichTextEditor
                    value={template.hero_subheadline || ""}
                    onChange={(value) => updateField("hero_subheadline", value)}
                    fieldName="Hero Subheadline"
                    supportsPersonalization
                  />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-6">
                    <Play className="w-4 h-4 mr-2" />
                    <EditableText
                      value={template.hero_cta_primary_text || "Book a call"}
                      onChange={(value) => updateField("hero_cta_primary_text", value)}
                      fieldName="Primary CTA"
                    />
                  </Button>
                  <Button variant="outline" size="lg" className="border-gray-300 text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <EditableText
                      value={template.hero_cta_secondary_text || "Get pricing"}
                      onChange={(value) => updateField("hero_cta_secondary_text", value)}
                      fieldName="Secondary CTA"
                    />
                  </Button>
                </div>

                {/* Video Player */}
                <div className="max-w-3xl mx-auto">
                  <EditableVideo
                    videoId={template.hero_video_id || "76979871"}
                    thumbnailUrl={template.hero_video_thumbnail_url || undefined}
                    onVideoChange={(videoId) => updateField("hero_video_id", videoId)}
                    onThumbnailChange={(url) => updateField("hero_video_thumbnail_url", url)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Trust Logos */}
          <section className="py-12 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-500 text-sm font-medium mb-6">
                Trusted by B2B teams across the US & Canada
              </p>
              <div className="flex justify-center">
                <EditableImage
                  src={template.client_logos_url || clientLogos}
                  alt="Client logos"
                  onImageChange={(url) => updateField("client_logos_url", url)}
                  fieldName="Client Logos"
                  className="max-w-2xl opacity-60"
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                  <RichTextEditor
                    value={template.features_title || ""}
                    onChange={(value) => updateField("features_title", value)}
                    fieldName="Features Title"
                    isHeadline
                  />
                </h2>
                <div className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                  <RichTextEditor
                    value={template.features_subtitle || ""}
                    onChange={(value) => updateField("features_subtitle", value)}
                    fieldName="Features Subtitle"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  <RichTextEditor
                    value={template.contact_title || "Ready to get started?"}
                    onChange={(value) => updateField("contact_title", value)}
                    fieldName="Contact Title"
                    isHeadline
                  />
                </h2>
                <div className="text-lg text-gray-600 mb-8">
                  <RichTextEditor
                    value={template.contact_subtitle || ""}
                    onChange={(value) => updateField("contact_subtitle", value)}
                    fieldName="Contact Subtitle"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Default template (Police Recruitment) - Full page with all sections
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <EditorSidebar
        templateName={template.name}
        hasChanges={hasChanges}
        isSaving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
        onPreview={handlePreview}
        onInsertToken={handleInsertToken}
      />

      {/* Main content - with right margin for sidebar */}
      <div className="mr-80">
        {/* Hero Section */}
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
            <header className="flex items-center justify-between mb-12 lg:mb-16">
              <img src={kickerLogo} alt="Kicker Video" className="h-8 md:h-10" />
              <Button variant="outline" size="lg">
                <EditableText
                  value={template.hero_cta_primary_text || "Get in Touch"}
                  onChange={(value) => updateField("hero_cta_primary_text", value)}
                  fieldName="Header CTA"
                />
              </Button>
            </header>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto text-center mb-12 lg:mb-16">
              <div className="text-primary font-medium tracking-wider uppercase mb-4">
                <RichTextEditor
                  value={template.hero_badge || ""}
                  onChange={(value) => updateField("hero_badge", value)}
                  fieldName="Hero Badge"
                  supportsPersonalization
                  isHeadline
                />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                <RichTextEditor
                  value={template.hero_headline}
                  onChange={(value) => updateField("hero_headline", value)}
                  fieldName="Hero Headline"
                  supportsPersonalization
                  isHeadline
                />
              </h1>
              
              <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                <RichTextEditor
                  value={template.hero_subheadline || ""}
                  onChange={(value) => updateField("hero_subheadline", value)}
                  fieldName="Hero Subheadline"
                  supportsPersonalization
                />
              </div>
            </div>

            {/* Video Player */}
            <div className="max-w-4xl mx-auto">
              <EditableVideo
                videoId={template.hero_video_id || "1153753885"}
                thumbnailUrl={template.hero_video_thumbnail_url || undefined}
                onVideoChange={(videoId) => updateField("hero_video_id", videoId)}
                onThumbnailChange={(url) => updateField("hero_video_thumbnail_url", url)}
              />
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-12 lg:mt-16">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <EditableText
                  value={template.hero_cta_secondary_text || "Learn More"}
                  onChange={(value) => updateField("hero_cta_secondary_text", value)}
                  fieldName="Scroll CTA"
                  className="text-sm uppercase tracking-wider"
                />
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* Logo Carousel Section */}
        <section className="py-12 bg-secondary/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
              Trusted by public organizations nationwide
            </p>
            
            <div className="flex justify-center">
              <EditableImage
                src={template.client_logos_url || clientLogos}
                alt="Client logos"
                onImageChange={(url) => updateField("client_logos_url", url)}
                fieldName="Client Logos"
                className="max-w-full"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 lg:py-32 bg-card relative">
          {/* Accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary rounded-full" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                <RichTextEditor
                  value={template.features_title || "Why Departments Choose Kicker Video"}
                  onChange={(value) => updateField("features_title", value)}
                  fieldName="About Section Title"
                  supportsPersonalization
                  isHeadline
                />
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <RichTextEditor
                  value={template.about_content || DEFAULT_ABOUT_CONTENT}
                  onChange={(value) => updateField("about_content", value)}
                  fieldName="About Section Body"
                  supportsPersonalization
                />
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Strip */}
        <section className="bg-background">
          <div className="w-full">
            <EditableImage
              src={template.portfolio_strip_url || portfolioStrip}
              alt="Portfolio examples"
              onImageChange={(url) => updateField("portfolio_strip_url", url)}
              fieldName="Portfolio Strip"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-20 lg:py-32 hero-gradient relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                <RichTextEditor
                  value={template.contact_title || "Ready to Transform Your Recruitment Strategy?"}
                  onChange={(value) => updateField("contact_title", value)}
                  fieldName="Contact Title"
                  supportsPersonalization
                  isHeadline
                />
              </h2>
              <div className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                <RichTextEditor
                  value={template.contact_subtitle || "Let's discuss how Kicker Video can help your department attract the next generation of law enforcement professionals."}
                  onChange={(value) => updateField("contact_subtitle", value)}
                  fieldName="Contact Subtitle"
                  supportsPersonalization
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button variant="hero" size="xl" asChild>
                  <a href="mailto:hello@kickervideo.com">
                    <Mail className="w-5 h-5" />
                    Contact Us
                  </a>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <a href="https://kickervideo.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5" />
                    Visit Website
                  </a>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-muted-foreground">
                <a 
                  href="mailto:hello@kickervideo.com" 
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <EditableText
                    value={template.contact_email || "hello@kickervideo.com"}
                    onChange={(value) => updateField("contact_email", value)}
                    fieldName="Contact Email"
                  />
                </a>
                <span className="hidden sm:block text-border">|</span>
                <a 
                  href="https://kickervideo.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  kickervideo.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <img src={kickerLogo} alt="Kicker Video" className="h-6" />

              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Kicker Video. Professional video production.
              </p>

              <a 
                href="https://kickervideo.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                kickervideo.com
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TemplateEditor;
