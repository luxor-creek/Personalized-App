import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { ArrowRight, Zap, Users, BarChart3, Layout, Sparkles, Shield } from "lucide-react";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo className="h-8" />
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-24 lg:py-36 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Now in Beta
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Personalized landing pages.{" "}
              <span className="text-primary">At scale.</span>{" "}
              In minutes.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Create a unique landing page for every contact on your list.
              No manual work. No complex setup. Launch a full personalized
              campaign in just a few clicks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-base px-8">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="text-base px-8">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Three steps to personalized outreach
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Go from template to live campaign faster than you thought possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Layout,
                title: "Pick a template",
                description:
                  "Choose from pre-built templates or create your own with our drag-and-drop builder.",
              },
              {
                step: "02",
                icon: Users,
                title: "Upload your contacts",
                description:
                  "Import a CSV or add contacts manually. Each person gets their own unique landing page.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Launch & track",
                description:
                  "Share personalized links via email. Track views, engagement, and conversions in real time.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <span className="text-5xl font-bold text-primary/10 absolute top-4 right-4 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to convert
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Layout,
                title: "Template Builder",
                desc: "Drag-and-drop page builder with sections for hero, video, features, testimonials, pricing, and contact forms.",
              },
              {
                icon: Users,
                title: "Bulk Personalization",
                desc: "Upload a CSV and automatically generate a unique page for every contact with personalized content.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                desc: "Track page views, video plays, scroll depth, time on page, and link clicks per contact.",
              },
              {
                icon: Zap,
                title: "Integrations",
                desc: "Connect with Snov.io, LemList, and more to power your outreach campaigns directly.",
              },
              {
                icon: Shield,
                title: "Custom Domains",
                desc: "Use your own domain for branded, professional-looking personalized page URLs.",
              },
              {
                icon: Sparkles,
                title: "AI Assistant",
                desc: "Get help with copy, campaign strategy, and optimization powered by AI.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-lg border border-border bg-card"
              >
                <f.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to personalize your outreach?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Start your free trial — no credit card required.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-base px-8">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo className="h-6" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Personalized Page. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
