import { useParams, useNavigate } from "react-router-dom";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditableText from "@/components/editor/EditableText";
import EditableVideo from "@/components/editor/EditableVideo";
import { Button } from "@/components/ui/button";
import kickerLogo from "@/assets/kicker-logo.png";
import clientLogos from "@/assets/client-logos.png";
import { ArrowDown, Play, DollarSign } from "lucide-react";

const TemplateEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

  // Render based on template type
  if (template.slug === "b2b-demo") {
    return (
      <div className="min-h-screen bg-white">
        <EditorToolbar
          templateName={template.name}
          hasChanges={hasChanges}
          isSaving={saving}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
        />

        {/* Add padding for fixed toolbar */}
        <div className="pt-24">
          {/* Hero Section */}
          <section className="pt-24 pb-16 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 rounded-full text-amber-800 text-sm font-medium mb-8">
                  <EditableText
                    value={template.hero_badge || ""}
                    onChange={(value) => updateField("hero_badge", value)}
                    fieldName="Hero Badge"
                    supportsPersonalization
                  />
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <EditableText
                    value={template.hero_headline}
                    onChange={(value) => updateField("hero_headline", value)}
                    fieldName="Hero Headline"
                    supportsPersonalization
                  />
                </h1>

                {/* Subheadline */}
                <div className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  <EditableText
                    value={template.hero_subheadline || ""}
                    onChange={(value) => updateField("hero_subheadline", value)}
                    fieldName="Hero Subheadline"
                    multiline
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

          {/* Trust Logos - Placeholder */}
          <section className="py-12 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-500 text-sm font-medium mb-6">
                Trusted by B2B teams across the US & Canada
              </p>
              <img 
                src={clientLogos} 
                alt="Client logos" 
                className="max-w-2xl mx-auto opacity-60"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                  <EditableText
                    value={template.features_title || ""}
                    onChange={(value) => updateField("features_title", value)}
                    fieldName="Features Title"
                  />
                </h2>
                <div className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                  <EditableText
                    value={template.features_subtitle || ""}
                    onChange={(value) => updateField("features_subtitle", value)}
                    fieldName="Features Subtitle"
                    multiline
                  />
                </div>
                
                {/* Placeholder for feature content */}
                <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    Feature cards and checklist items can be edited here.
                    <br />
                    <span className="text-sm">(Full feature card editing coming soon)</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  <EditableText
                    value={template.contact_title || "Ready to get started?"}
                    onChange={(value) => updateField("contact_title", value)}
                    fieldName="Contact Title"
                  />
                </h2>
                <div className="text-lg text-gray-600 mb-8">
                  <EditableText
                    value={template.contact_subtitle || ""}
                    onChange={(value) => updateField("contact_subtitle", value)}
                    fieldName="Contact Subtitle"
                    multiline
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Default template (Police Recruitment)
  return (
    <div className="min-h-screen bg-background">
      <EditorToolbar
        templateName={template.name}
        hasChanges={hasChanges}
        isSaving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
        onPreview={handlePreview}
      />

      {/* Add padding for fixed toolbar */}
      <div className="pt-24">
        {/* Hero Section */}
        <section className="min-h-screen hero-gradient relative overflow-hidden">
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
                <EditableText
                  value={template.hero_badge || ""}
                  onChange={(value) => updateField("hero_badge", value)}
                  fieldName="Hero Badge"
                  supportsPersonalization
                />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                <EditableText
                  value={template.hero_headline}
                  onChange={(value) => updateField("hero_headline", value)}
                  fieldName="Hero Headline"
                  supportsPersonalization
                />
              </h1>
              
              <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                <EditableText
                  value={template.hero_subheadline || ""}
                  onChange={(value) => updateField("hero_subheadline", value)}
                  fieldName="Hero Subheadline"
                  multiline
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

        {/* Features Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                <EditableText
                  value={template.features_title || "About Our Process"}
                  onChange={(value) => updateField("features_title", value)}
                  fieldName="Features Title"
                />
              </h2>
              <div className="text-lg text-muted-foreground mb-12">
                <EditableText
                  value={template.features_subtitle || ""}
                  onChange={(value) => updateField("features_subtitle", value)}
                  fieldName="Features Subtitle"
                  multiline
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <EditableText
                value={template.contact_title || "Let's Talk"}
                onChange={(value) => updateField("contact_title", value)}
                fieldName="Contact Title"
              />
            </h2>
            <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <EditableText
                value={template.contact_subtitle || ""}
                onChange={(value) => updateField("contact_subtitle", value)}
                fieldName="Contact Subtitle"
                multiline
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TemplateEditor;
