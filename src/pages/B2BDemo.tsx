import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoPlayer from "@/components/VideoPlayer";
import SampleRequestForm from "@/components/SampleRequestForm";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import clientLogos from "@/assets/client-logos.png";
import { 
  Play, 
  DollarSign, 
  CheckCircle, 
  Phone, 
  PlayCircle,
  Route,
  Sparkles,
  Target,
  Handshake,
  Quote,
  Check,
  ArrowRight,
  Mail,
  Download,
  Film,
  Calendar
} from "lucide-react";
import { useTemplateContent } from "@/hooks/useTemplateContent";

const B2BDemo = () => {
  const { template, loading } = useTemplateContent("b2b-demo");

  const scrollToContact = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Defaults (match what the editor edits)
  const defaultFeatureList = [
    { title: "Script to screen in weeks, not months.", description: "Detailed pre‑pro and rapid iteration." },
    { title: "On‑brand, on‑budget.", description: "Clear scopes; no surprises." },
    { title: "Local crews in 21 cities.", description: "Lower travel costs across US & Canada." },
  ];

  const defaultFeatureCards = [
    {
      title: "A guided process",
      description: "Kickoff, creative brief, pre‑pro, production, post. Aligned and transparent at every step.",
    },
    { title: "AI‑assisted efficiency", description: "Faster scripting, storyboards, and revisions without sacrificing quality." },
    { title: "Outcomes that convert", description: "Sales‑ready demos, explainer videos, and launch assets your team can deploy fast." },
    { title: "Seamless collaboration", description: "We plug into your workflow with timely check‑ins and clear revision windows." },
  ];

  const defaultTestimonials = [
    {
      quote: "They distilled our complex platform into a crisp, 2‑minute demo that our sales team uses daily.",
      author: "VP Marketing, SaaS",
    },
    {
      quote: "Fast, organized, and on brand. The process was seamless even across two locations.",
      author: "Director of Product Marketing, Healthcare",
    },
    {
      quote: "Great value for the quality. Clear scope and quick iterations saved us weeks.",
      author: "Head of Comms, Manufacturing",
    },
  ];

  const defaultPricingTiers = [
    {
      name: "Social & cut‑downs",
      description: "Short‑form assets, repurposed edits",
      price: "From <$1k",
      features: [":15–:45 edits • captions • thumbnails", "Fast turnaround"],
      cta: "Request scope",
      featured: false,
    },
    {
      name: "Product demo / explainer",
      description: "90–120s primary asset + cut‑downs",
      price: "$3k–$8k",
      features: ["Script, storyboard, VO/music", "Animation or live‑action"],
      cta: "Start your demo",
      featured: true,
    },
    {
      name: "Multi‑location shoot",
      description: "Crews in 21 cities to reduce travel",
      price: "$8k–$25k",
      features: ["Producer + crew + gear", "Full post‑production", "Price depends on # of locations"],
      cta: "Get a quote",
      featured: false,
    },
  ];

  const featureList = template?.features_list?.length ? template.features_list : defaultFeatureList;
  const featureCards = template?.feature_cards?.length ? template.feature_cards : defaultFeatureCards;
  const testimonials = template?.testimonials?.length ? template.testimonials : defaultTestimonials;
  const pricingTiers = template?.pricing_tiers?.length ? template.pricing_tiers : defaultPricingTiers;

  // Use template values with fallbacks
  const badge = template?.hero_badge || "Kicker Video — B2B Video Production";
  const headline = template?.hero_headline || "Your Product Demo, Sharpened for Decision‑Makers";
  const subheadline = template?.hero_subheadline || "Built for marketing and product leaders who need a clear, on‑brand story.";
  const ctaPrimary = template?.hero_cta_primary_text || "Book a 15‑min strategy call";
  const ctaSecondary = template?.hero_cta_secondary_text || "Get pricing";
  const videoId = template?.hero_video_id || "76979871";
  const featuresTitle = template?.features_title || "Clarity, speed, and on‑brand delivery";
  const featuresSubtitle = template?.features_subtitle || "We blend senior creative teams with AI‑assisted tooling to cut timelines and keep costs predictable.";
  const contactTitle = template?.contact_title || "Ready to plan your demo?";
  const contactSubtitle = template?.contact_subtitle || "Tell us about your audience, goals, and deadline. We'll return with a simple plan, scope, and timeline.";
  const trustText = template?.about_content || "Trusted by B2B teams across the US & Canada";
  const testimonialsTitle = template?.testimonials_title || "What B2B teams say";
  const testimonialsSubtitle = template?.testimonials_subtitle || "Marketing, product, and comms leaders across tech, healthcare, energy, and manufacturing.";
  const pricingTitle = template?.pricing_title || "Project‑based pricing";
  const pricingSubtitle = template?.pricing_subtitle || "Every project is scoped to your needs. Typical ranges shown below.";

  const vis = template?.personalization_config || {};
  const isSectionVisible = (key: string) => vis[key] !== false;

  return (
    <TemplateAccentProvider accentColor={template?.accent_color} className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToContact}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book a call
          </Button>
          {template?.logo_url ? (
            <img src={template.logo_url} alt="Logo" className="h-8 object-contain" />
          ) : null}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8">
              <Film className="w-4 h-4" />
              {badge}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={scrollToContact}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                <Play className="w-4 h-4 mr-2" />
                {ctaPrimary}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToPricing}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {ctaSecondary}
              </Button>
            </div>

            {/* Video Player */}
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <VideoPlayer videoId={videoId} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      {isSectionVisible("show_trust") && (
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium mb-6">
            {trustText}
          </p>
          <img 
            src={template?.client_logos_url || clientLogos}
            alt="Client logos" 
            className="max-w-2xl mx-auto opacity-60 grayscale hover:grayscale-0 transition-all"
          />
        </div>
      </section>
      )}

      {/* Features Section */}
      {isSectionVisible("show_features") && (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              {featuresTitle}
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              {featuresSubtitle}
            </p>

            {/* Check List */}
            <div className="space-y-4 mb-12">
              {featureList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <span className="font-semibold">{item.title}</span> {item.description ? ` ${item.description}` : ""}
                  </p>
                </div>
              ))}
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={scrollToContact}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Talk to a producer
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToWork}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                See more work
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {[Route, Sparkles, Target, Handshake].map((Icon, idx) => {
                const card = featureCards[idx];
                if (!card) return null;
                return (
                  <Card key={idx} className="border-gray-200 bg-gray-50/50">
                    <CardHeader>
                      <Icon className="w-8 h-8 text-primary mb-2" />
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{card.description || ("subtitle" in card ? (card.subtitle as string | undefined) : undefined) || ""}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      {isSectionVisible("show_testimonials") && (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              {testimonialsTitle}
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              {testimonialsSubtitle}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t, idx) => (
                <Card key={idx} className="bg-white border-gray-200">
                  <CardContent className="pt-6">
                    <Quote className="w-8 h-8 text-gray-300 mb-4" />
                    <blockquote className="text-gray-700 mb-4">"{t.quote}"</blockquote>
                    {t.author ? (
                      <p className="text-sm text-gray-500 font-medium">{t.author}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing Section */}
      {isSectionVisible("show_pricing") && (
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              {pricingTitle}
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              {pricingSubtitle}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.slice(0, 3).map((tier, idx) => {
                const isFeatured = !!tier.featured;
                return (
                  <Card
                    key={idx}
                    className={
                      isFeatured
                        ? "border-primary/50 bg-primary/5 ring-2 ring-primary/30"
                        : "border-gray-200 bg-white"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <p className="text-sm text-gray-500">{tier.description || ""}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900 mb-4">{tier.price || ""}</p>
                      <ul className="space-y-2 mb-6">
                        {(tier.features || []).map((f, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-gray-600 text-sm">
                            <Check className="w-4 h-4 text-green-600" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isFeatured ? "default" : "outline"}
                        className={
                          isFeatured
                            ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "w-full border-gray-300"
                        }
                        onClick={scrollToContact}
                      >
                        {tier.cta || "Request scope"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Work/Portfolio CTA Section */}
      {isSectionVisible("show_portfolio_cta") && (
      <section id="work" className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to see more examples?
            </h3>
            <p className="text-gray-600 mb-8">
              Explore explainer, brand, trade show, and testimonial work across tech, healthcare, energy, and manufacturing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={scrollToContact}
              >
                <Mail className="w-4 h-4 mr-2" />
                Request a curated reel
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={scrollToContact}
              >
                <Download className="w-4 h-4 mr-2" />
                Get a sample brief
              </Button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Contact Section with Sample Request Form */}
      {isSectionVisible("show_form") && (
      <SampleRequestForm />
      )}

      {/* Footer */}
      {template?.logo_url && (
        <footer className="py-6 bg-gray-100 border-t border-gray-200">
          <div className="container mx-auto px-4 flex justify-center">
            <img src={template.logo_url} alt="Logo" className="h-6 object-contain" />
          </div>
        </footer>
      )}
    </TemplateAccentProvider>
  );
};

export default B2BDemo;
