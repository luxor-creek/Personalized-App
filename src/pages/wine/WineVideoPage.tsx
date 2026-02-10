import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SampleRequestForm from "@/components/SampleRequestForm";
import { applyPersonalization, type TemplateContent } from "@/hooks/useTemplateContent";
import { renderPersonalizedFormattedText } from "@/lib/formatText";
import {
  Sparkles,
  Calendar,
  PlayCircle,
  Phone,
  ArrowRight,
  Quote,
  CheckCircle2,
  Film,
  X,
  Check,
} from "lucide-react";

type PersonalizationData = {
  first_name?: string;
  last_name?: string;
  company?: string;
  full_name?: string;
};

function getPersonalizationFromUrl(): PersonalizationData {
  const params = new URLSearchParams(window.location.search);
  const first_name = params.get("first_name") || undefined;
  const last_name = params.get("last_name") || undefined;
  const company = params.get("company") || undefined;
  const full_name = params.get("full_name") || undefined;

  // Design preview defaults (match prior behavior)
  return {
    first_name: first_name ?? "Sarah",
    last_name,
    company: company ?? "Swift Compass",
    full_name,
  };
}

const DEFAULT_PORTFOLIO_VIDEOS = [
  { title: "Product overview", videoId: "1084786498" },
  { title: "Brand story", videoId: "1084786498" },
  { title: "Event/trade show", videoId: "1084786498" },
];

const DEFAULT_FEATURE_CARDS = [
  { title: "No Filming", subtitle: "No camera crews" },
  { title: "No Scriptwriting", subtitle: "Content comes from your pages" },
  { title: "No Delay", subtitle: "Fast Turnaround" },
];

type TestimonialLike = string | { quote?: string | null };

const normalizeTestimonials = (value: unknown): TestimonialLike[] => {
  // We only render what’s stored in the template (editable via the editor).
  // If nothing is stored yet, we render zero testimonials rather than hardcoded copy.
  if (!value) return [];
  if (Array.isArray(value)) return value as TestimonialLike[];
  if (typeof value === "object") return Object.values(value as Record<string, unknown>) as TestimonialLike[];
  return [];
};

const getTestimonialQuote = (testimonial: TestimonialLike): string => {
  if (typeof testimonial === "string") return testimonial;
  return testimonial?.quote || "";
};

const DEFAULT_COMPARISON_PROBLEM_ITEMS = [
  "Traditional video production doesn't scale",
  "Static pages underperform in engagement",
  "Search and AI discovery prioritize video",
];

const DEFAULT_COMPARISON_SOLUTION_ITEMS = [
  "Automated generation from existing content",
  "Template-driven consistency",
  "Bulk processing capability",
  "White-label delivery",
];

export default function WineVideoPage({ template }: { template: TemplateContent | null }) {
  const personalization = getPersonalizationFromUrl();
  const personalizationData = {
    first_name: personalization.first_name || "",
    last_name: personalization.last_name || "",
    company: personalization.company || "",
    full_name:
      personalization.full_name ||
      `${personalization.first_name || ""} ${personalization.last_name || ""}`.trim(),
  };

  const firstName = personalizationData.first_name || "there";
  const companyName = personalizationData.company || "your company";

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const vis = template?.personalization_config || {};
  const isSectionVisible = (key: string) => vis[key] !== false;

  const portfolioVideos = template?.portfolio_videos?.length
    ? template.portfolio_videos
    : DEFAULT_PORTFOLIO_VIDEOS;

  const featureCards = template?.feature_cards?.length ? template.feature_cards : DEFAULT_FEATURE_CARDS;
  const testimonials = normalizeTestimonials(template?.testimonials);

  const comparisonProblemTitle = template?.comparison_problem_title || "Why this works:";
  const comparisonProblemItems = template?.comparison_problem_items?.length
    ? template.comparison_problem_items
    : DEFAULT_COMPARISON_PROBLEM_ITEMS;

  const comparisonSolutionTitle = template?.comparison_solution_title || "Infrastructure for Practical Video at Scale";
  const comparisonSolutionDescription =
    template?.comparison_solution_description ||
    "Kicker takes your winery’s existing product pages and creates short videos for each wine, making them easy to discover, share, and promote across today’s digital channels.";
  const comparisonSolutionItems = template?.comparison_solution_items?.length
    ? template.comparison_solution_items
    : DEFAULT_COMPARISON_SOLUTION_ITEMS;

  const pricingImageUrl = template?.custom_section_image_url ||
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop";

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {template?.logo_url ? (
              <img src={template.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : null}
            {companyName && (
              <>
                {template?.logo_url && <span className="text-muted-foreground">×</span>}
                <div className="flex items-center gap-1">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-foreground">{companyName}</span>
                </div>
              </>
            )}
        </div>
        {isSectionVisible("show_header_cta") && (
        <Button variant="outline" className="gap-2" onClick={scrollToForm}>
          <Phone className="w-4 h-4" />
          {template?.hero_cta_primary_text || "Get a Free Video"}
        </Button>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-white rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">
                {renderPersonalizedFormattedText(template?.hero_badge || "Personalized for {{company}}", personalizationData, "hero-badge-")}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                  {renderPersonalizedFormattedText(
                    template?.hero_headline ||
                      "Hi {{first_name}}, you're going to love the proposal we have for {{company}}.",
                    personalizationData,
                    "hero-headline-"
                  )}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {renderPersonalizedFormattedText(template?.hero_subheadline || "", personalizationData, "hero-sub-")}
                </p>

                <div className="flex flex-wrap gap-3">
                  {isSectionVisible("show_hero_cta_primary") && (
                  <Button
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={scrollToForm}
                  >
                    <Calendar className="w-4 h-4" />
                    {template?.hero_cta_primary_text || "Get a Free Video"}
                  </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                    {template?.hero_video_id ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${template.hero_video_id}?badge=0&autopause=0&player_id=0&app_id=58479`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                        className="absolute inset-0 w-full h-full"
                        title="Hero Video"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <p className="text-muted-foreground">No video configured</p>
                      </div>
                    )}
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
      {isSectionVisible("show_features") && (
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {template?.features_title || "Simple Video Production"}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            {template?.features_subtitle ||
              "We turn your existing wine product pages into short, elegant videos that highlight each bottle, then prepare those videos for modern discovery across search, social, and video platforms."}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {featureCards.slice(0, 3).map((card, idx) => (
              <Card key={idx} className="p-6 bg-white text-center">
                <div className="text-2xl font-bold text-foreground mb-2">{card.title}</div>
                <p className="text-muted-foreground">{card.subtitle || card.description || ""}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Process Section */}
      {isSectionVisible("show_process") && (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            {template?.about_content || "A simple process built for busy wine marketers"}
          </h2>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                number: 1,
                title: "Send URLs",
                description: "Send the URL's of each product. This can be links or a csv spreadsheet.",
              },
              { number: 2, title: "Template", description: "We create the branded template for your approval and revisions." },
              { number: 3, title: "Production", description: "We produce all videos within 2-3 days." },
              { number: 4, title: "Review", description: "You review them." },
              { number: 5, title: "Delivery", description: "Delivery to you." },
            ].map((step) => (
              <div key={step.number} className="text-center">
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
      )}

      {/* Portfolio Section */}
      {isSectionVisible("show_portfolio") && (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {template?.testimonials_subtitle || "Other Examples"}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
            {template?.portfolio_strip_url ||
              "Here are a few other videos our automated system produced using only the product webpage URL's. Scripted, voiced, and edited in less than an hour."}
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
      )}

      {/* Testimonials Section */}
      {isSectionVisible("show_testimonials") && (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
            {renderPersonalizedFormattedText(template?.testimonials_title || "What teams like {{company}} say", personalizationData, "testimonials-title-")}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, index) => (
              <Card key={index} className="p-6 bg-gray-50 border-0">
                <Quote className="w-6 h-6 text-amber-500 mb-4" />
                <p className="text-foreground leading-relaxed">"{getTestimonialQuote(t)}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Comparison Section */}
      {isSectionVisible("show_comparison") && (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">THE PROBLEM</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{comparisonProblemTitle}</h2>
              <div className="space-y-4">
                {comparisonProblemItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 bg-white border border-gray-200">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-4">THE SOLUTION</p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{comparisonSolutionTitle}</h3>
              <p className="text-muted-foreground mb-6">{comparisonSolutionDescription}</p>
              <div className="space-y-3">
                {comparisonSolutionItems.map((item, index) => (
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
      )}

      {/* Pricing Section */}
      {isSectionVisible("show_pricing") && (
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {template?.pricing_title || "Want something more custom?"}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {template?.pricing_subtitle ||
                  "Project-based pricing with options for scope. Social clips can start under $1k; multi-location shoots may exceed $10k."}
              </p>

              <ul className="space-y-4 mb-8">
                {(template?.comparison_solution_items || [
                  "Transparent estimates before kickoff",
                  "21-city crew network, minimal travel costs",
                  "Live action, animation, or hybrid",
                ]).map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                {isSectionVisible("show_pricing_cta") && (
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={scrollToForm}>
                  Get a Free Video
                </Button>
                )}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <img
                src={pricingImageUrl}
                alt="Production example"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Banner */}
      {isSectionVisible("show_cta_banner") && (
      <section className="py-16 px-6 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {renderPersonalizedFormattedText(template?.cta_banner_title || `Let's work together, {{first_name}}`, personalizationData, "cta-title-")}
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            {renderPersonalizedFormattedText(
              template?.cta_banner_subtitle || `We're excited to show {{company}} what's possible. Get started in minutes.`,
              personalizationData,
              "cta-sub-"
            )}
          </p>
        </div>
      </section>
      )}

      {/* Sample Request Form Section */}
      {isSectionVisible("show_form") && (
      <SampleRequestForm
        title={template?.form_section_title || undefined}
        subtitle={template?.form_section_subtitle || undefined}
        templateId={template?.id}
      />
      )}

      {/* Final CTA Section */}
      {isSectionVisible("show_contact") && (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {renderPersonalizedFormattedText(template?.contact_title || "Let's make {{company}} the obvious choice", personalizationData, "contact-title-")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {renderPersonalizedFormattedText(
              template?.contact_subtitle ||
                "Book a quick brainstorm with a senior producer. We'll scope ideas, timelines, and budget in one call.",
              personalizationData,
              "contact-sub-"
            )}
          </p>

          {isSectionVisible("show_final_cta") && (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={scrollToForm}>
              <Phone className="w-4 h-4" />
              Get a Free Video
            </Button>
          </div>
          )}
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {template?.logo_url ? (
              <img src={template.logo_url} alt="Logo" className="h-6 object-contain" />
            ) : null}
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Kicker Video. Professional video production.</p>
        </div>
      </footer>
    </div>
  );
}
