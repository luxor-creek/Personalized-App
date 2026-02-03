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
import { ArrowDown, Play, DollarSign, Mail, ExternalLink, X, Check } from "lucide-react";
import SampleRequestForm from "@/components/SampleRequestForm";

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


  // Wine Video template
  if (template.slug === "wine-video") {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        {/* Sidebar */}
        <EditorSidebar
          templateName={template.name}
          hasChanges={hasChanges}
          isSaving={saving}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={() => window.open("/wine-video", "_blank")}
          onInsertToken={handleInsertToken}
        />

        {/* Main content - with right margin for sidebar */}
        <div className="mr-80">
          {/* Header */}
          <header className="py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={kickerLogo} alt="Kicker Video" className="h-8" />
              <span className="text-muted-foreground">×</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">
                  <RichTextEditor
                    value={template.hero_badge || "Personalized for {{company}}"}
                    onChange={(value) => updateField("hero_badge", value)}
                    fieldName="Header Company Badge"
                    supportsPersonalization
                    isHeadline
                  />
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <EditableText
                value={template.hero_cta_primary_text || "Book a call"}
                onChange={(value) => updateField("hero_cta_primary_text", value)}
                fieldName="Header CTA"
              />
            </Button>
          </header>

          {/* Hero Section */}
          <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="p-8 md:p-12 bg-white rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 mb-6">
                  <span className="text-sm font-medium uppercase tracking-wide">
                    Personalized for <span className="text-amber-500">{"{{company}}"}</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                      <RichTextEditor
                        value={template.hero_headline}
                        onChange={(value) => updateField("hero_headline", value)}
                        fieldName="Hero Headline"
                        supportsPersonalization
                        isHeadline
                      />
                    </h1>
                    <div className="text-lg text-muted-foreground mb-8">
                      <RichTextEditor
                        value={template.hero_subheadline || "$20 each? We will produce a custom video for each of your wine's for $20."}
                        onChange={(value) => updateField("hero_subheadline", value)}
                        fieldName="Hero Subheadline"
                        supportsPersonalization
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
                        Book a call
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <EditableText
                          value={template.hero_cta_secondary_text || "See portfolio"}
                          onChange={(value) => updateField("hero_cta_secondary_text", value)}
                          fieldName="Secondary CTA"
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="relative">
                    <EditableVideo
                      videoId={template.hero_video_id || "76979871"}
                      thumbnailUrl={template.hero_video_thumbnail_url || undefined}
                      onVideoChange={(videoId) => updateField("hero_video_id", videoId)}
                      onThumbnailChange={(url) => updateField("hero_video_thumbnail_url", url)}
                    />
                    <p className="mt-3 text-muted-foreground">
                      <span className="text-amber-500 font-medium">{"{{first_name}}"}</span>, take a look at this video demo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Simple Video Production Section */}
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                <RichTextEditor
                  value={template.features_title || "Simple Video Production"}
                  onChange={(value) => updateField("features_title", value)}
                  fieldName="Features Title"
                  isHeadline
                />
              </h2>
              <div className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                <RichTextEditor
                  value={template.features_subtitle || "We turn your existing wine product pages into short, elegant videos that highlight each bottle, then prepare those videos for modern discovery across search, social, and video platforms."}
                  onChange={(value) => updateField("features_subtitle", value)}
                  fieldName="Features Subtitle"
                />
              </div>

              {/* Feature Cards - Editable */}
              <div className="grid md:grid-cols-3 gap-6">
                {(template.feature_cards?.length > 0 
                  ? template.feature_cards 
                  : [
                      { title: "No Filming", subtitle: "No camera crews" },
                      { title: "No Scriptwriting", subtitle: "Content comes from your pages" },
                      { title: "No Delay", subtitle: "Fast Turnaround" },
                    ]
                ).map((card: any, index: number) => (
                  <div key={index} className="p-6 bg-white rounded-lg text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      <EditableText
                        value={card.title || ""}
                        onChange={(value) => {
                          const newCards = [...(template.feature_cards?.length > 0 
                            ? template.feature_cards 
                            : [
                                { title: "No Filming", subtitle: "No camera crews" },
                                { title: "No Scriptwriting", subtitle: "Content comes from your pages" },
                                { title: "No Delay", subtitle: "Fast Turnaround" },
                              ])];
                          newCards[index] = { ...newCards[index], title: value };
                          updateField("feature_cards", newCards);
                        }}
                        fieldName={`Feature Card ${index + 1} Title`}
                      />
                    </div>
                    <div className="text-muted-foreground">
                      <EditableText
                        value={card.subtitle || ""}
                        onChange={(value) => {
                          const newCards = [...(template.feature_cards?.length > 0 
                            ? template.feature_cards 
                            : [
                                { title: "No Filming", subtitle: "No camera crews" },
                                { title: "No Scriptwriting", subtitle: "Content comes from your pages" },
                                { title: "No Delay", subtitle: "Fast Turnaround" },
                              ])];
                          newCards[index] = { ...newCards[index], subtitle: value };
                          updateField("feature_cards", newCards);
                        }}
                        fieldName={`Feature Card ${index + 1} Subtitle`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-16 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                <RichTextEditor
                  value={template.about_content || "A simple process built for busy wine marketers"}
                  onChange={(value) => updateField("about_content", value)}
                  fieldName="Process Section Title"
                  isHeadline
                />
              </h2>

              {/* Process Steps */}
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

          {/* Other Examples / Portfolio Section */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Other Examples
                </h2>
                <Button variant="link" className="gap-2 text-indigo-600 p-0">
                  Request a tailored reel
                  <ArrowDown className="w-4 h-4 rotate-[-90deg]" />
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {(template.portfolio_videos?.length > 0 
                  ? template.portfolio_videos 
                  : [
                      { title: "Product overview", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop" },
                      { title: "Brand story", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop" },
                      { title: "Event/trade show", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop" },
                    ]
                ).map((item: any, index: number) => (
                  <div key={index} className="overflow-hidden rounded-lg group">
                    <div className="relative aspect-video">
                      <EditableImage
                        src={item.image}
                        alt={item.title}
                        onImageChange={(url) => {
                          const newVideos = [...(template.portfolio_videos?.length > 0 
                            ? template.portfolio_videos 
                            : [
                                { title: "Product overview", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop" },
                                { title: "Brand story", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop" },
                                { title: "Event/trade show", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop" },
                              ])];
                          newVideos[index] = { ...newVideos[index], image: url };
                          updateField("portfolio_videos", newVideos);
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-white">
                      <EditableText
                        value={item.title}
                        onChange={(value) => {
                          const newVideos = [...(template.portfolio_videos?.length > 0 
                            ? template.portfolio_videos 
                            : [
                                { title: "Product overview", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop" },
                                { title: "Brand story", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop" },
                                { title: "Event/trade show", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop" },
                              ])];
                          newVideos[index] = { ...newVideos[index], title: value };
                          updateField("portfolio_videos", newVideos);
                        }}
                        fieldName={`Portfolio Video ${index + 1} Title`}
                        className="font-medium text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                <RichTextEditor
                  value={template.testimonials_title || "What teams like {{company}} say"}
                  onChange={(value) => updateField("testimonials_title", value)}
                  fieldName="Testimonials Title"
                  supportsPersonalization
                  isHeadline
                />
              </h2>

              {/* Testimonial Cards - Editable */}
              <div className="grid md:grid-cols-3 gap-6">
                {(template.testimonials?.length > 0 
                  ? template.testimonials 
                  : [
                      { quote: "Kicker made complex messaging simple and engaging. Fast, on-budget, and on-brand." },
                      { quote: "Smooth process from brief to delivery. Their team felt like an extension of ours." },
                      { quote: "The videos moved the needle on demos and deal velocity. Highly recommend." },
                    ]
                ).map((testimonial: any, index: number) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-lg border-0">
                    <div className="w-6 h-6 text-amber-500 mb-4">❝</div>
                    <div className="text-foreground leading-relaxed">
                      <EditableText
                        value={typeof testimonial === 'string' ? testimonial : (testimonial.quote || "")}
                        onChange={(value) => {
                          const existingTestimonials = template.testimonials?.length > 0 
                            ? template.testimonials 
                            : [
                                { quote: "Kicker made complex messaging simple and engaging. Fast, on-budget, and on-brand." },
                                { quote: "Smooth process from brief to delivery. Their team felt like an extension of ours." },
                                { quote: "The videos moved the needle on demos and deal velocity. Highly recommend." },
                              ];
                          const newTestimonials = [...existingTestimonials];
                          newTestimonials[index] = { quote: value };
                          updateField("testimonials", newTestimonials);
                        }}
                        fieldName={`Testimonial ${index + 1}`}
                        multiline
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Comparison Section - Problem vs Solution */}
          <section className="py-16 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Problem Side */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    THE PROBLEM
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                    <RichTextEditor
                      value={template.comparison_problem_title || "Why Viaxo Exists"}
                      onChange={(value) => updateField("comparison_problem_title", value)}
                      fieldName="Problem Title"
                      isHeadline
                    />
                  </h2>
                  <div className="space-y-4">
                    {(template.comparison_problem_items?.length > 0 
                      ? template.comparison_problem_items 
                      : ["Traditional video production doesn't scale", "Static pages underperform in engagement", "Search and AI discovery prioritize video"]
                    ).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <EditableText
                          value={item}
                          onChange={(value) => {
                            const newItems = [...(template.comparison_problem_items || [])];
                            newItems[index] = value;
                            updateField("comparison_problem_items", newItems);
                          }}
                          fieldName={`Problem Item ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution Side */}
                <div className="p-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-4">
                    THE SOLUTION
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    <RichTextEditor
                      value={template.comparison_solution_title || "Infrastructure for Practical Video at Scale"}
                      onChange={(value) => updateField("comparison_solution_title", value)}
                      fieldName="Solution Title"
                      isHeadline
                    />
                  </h3>
                  <div className="text-muted-foreground mb-6">
                    <RichTextEditor
                      value={template.comparison_solution_description || "Viaxo provides infrastructure that makes video practical across entire catalogs and campaigns."}
                      onChange={(value) => updateField("comparison_solution_description", value)}
                      fieldName="Solution Description"
                    />
                  </div>
                  <div className="space-y-3">
                    {(template.comparison_solution_items?.length > 0 
                      ? template.comparison_solution_items 
                      : ["Automated generation from existing content", "Template-driven consistency", "Bulk processing capability", "White-label delivery"]
                    ).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <EditableText
                          value={item}
                          onChange={(value) => {
                            const newItems = [...(template.comparison_solution_items || [])];
                            newItems[index] = value;
                            updateField("comparison_solution_items", newItems);
                          }}
                          fieldName={`Solution Item ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    <RichTextEditor
                      value={template.pricing_title || "Want something more custom?"}
                      onChange={(value) => updateField("pricing_title", value)}
                      fieldName="Pricing Title"
                      isHeadline
                    />
                  </h2>
                  <div className="text-lg text-muted-foreground mb-8">
                    <RichTextEditor
                      value={template.pricing_subtitle || "Project-based pricing with options for scope. Social clips can start under $1k; multi-location shoots may exceed $10k."}
                      onChange={(value) => updateField("pricing_subtitle", value)}
                      fieldName="Pricing Subtitle"
                    />
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Transparent estimates before kickoff",
                      "21-city crew network, minimal travel costs",
                      "Live action, animation, or hybrid",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 text-emerald-500 flex-shrink-0">✓</div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
                      Get a tailored quote
                    </Button>
                    <Button variant="outline" className="gap-2">
                      See more work
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden">
                  <EditableImage
                    src={template.custom_section_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"}
                    alt="Custom section"
                    onImageChange={(url) => updateField("custom_section_image_url", url)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Purple CTA Section */}
          <section className="py-16 px-6 bg-gradient-to-br from-indigo-600 to-indigo-700">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Let's work together, <span className="text-amber-400">{"{{first_name}}"}</span>
              </h2>
              <p className="text-lg text-indigo-100 mb-8">
                We're excited to show <span className="text-amber-300">{"{{company}}"}</span> what's possible. Get started in minutes.
              </p>
            </div>
          </section>

          {/* Sample Request Form Section */}
          <SampleRequestForm />

          {/* Final CTA Section */}
          <section className="py-16 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                <RichTextEditor
                  value={template.contact_title || "Let's make {{company}} the obvious choice"}
                  onChange={(value) => updateField("contact_title", value)}
                  fieldName="Contact Title"
                  supportsPersonalization
                  isHeadline
                />
              </h2>
              <div className="text-lg text-muted-foreground mb-8">
                <RichTextEditor
                  value={template.contact_subtitle || "Book a quick brainstorm with a senior producer. We'll scope ideas, timelines, and budget in one call."}
                  onChange={(value) => updateField("contact_subtitle", value)}
                  fieldName="Contact Subtitle"
                  supportsPersonalization
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-gray-900 hover:bg-gray-800">
                  Book a call
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  Request reel
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 px-6 bg-gray-50 border-t">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <img src={kickerLogo} alt="Kicker Video" className="h-6" />
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Kicker Video. Professional video production.
              </p>
            </div>
          </footer>
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
