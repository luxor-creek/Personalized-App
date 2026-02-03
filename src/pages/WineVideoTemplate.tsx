import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import kickerLogo from "@/assets/kicker-logo.png";
import { 
  Sparkles, 
  Calendar, 
  PlayCircle, 
  Play, 
  Phone, 
  FileText, 
  Clapperboard, 
  Scissors, 
  Send, 
  ArrowRight,
  Quote,
  CheckCircle2,
  Film
} from "lucide-react";

const WineVideoTemplate = () => {
  // Mock personalization data for design preview
  const firstName = "Sarah";
  const companyName = "Swift Compass";

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={kickerLogo} alt="Kicker Video" className="h-8" />
          <span className="text-muted-foreground">×</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">Viaxo</span>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Phone className="w-4 h-4" />
          Book a call
        </Button>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-white rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">
                Personalized for {companyName}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                  Hi <span className="text-amber-500">{firstName}</span>, you're going to love the proposal we have for{" "}
                  <span className="text-amber-500">{companyName}</span>.
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  $20 each? We will produce a custom video for each of your wine's for $20.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
                    <Calendar className="w-4 h-4" />
                    Book a call
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <PlayCircle className="w-4 h-4" />
                    See portfolio
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500">
                  <img 
                    src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=450&fit=crop"
                    alt="Wine video production"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
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
            Simple Video Production
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Viaxo turns your existing wine product pages into short, elegant videos that highlight each bottle, then prepares those videos for modern discovery across search, social, and video platforms.
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
            A simple process built for busy B2B teams
          </h2>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: Phone, title: "Kick-off", description: "Align goals and audience." },
              { icon: FileText, title: "Creative brief", description: "Messaging + script." },
              { icon: Clapperboard, title: "Production", description: "Live action or animation." },
              { icon: Scissors, title: "Post", description: "Edit, motion, revisions." },
              { icon: Send, title: "Delivery", description: "Ready for launch." },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                    <step.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Recent work your buyers will love
            </h2>
            <Button variant="link" className="gap-2 text-indigo-600 p-0">
              Request a tailored reel
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Product overview", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop" },
              { title: "Brand story", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop" },
              { title: "Event/trade show", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop" },
            ].map((item, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer">
                <div className="relative aspect-video">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
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
            What teams like <span className="text-amber-500">{companyName}</span> say
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

      {/* Pricing Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Budgets that fit the brief
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Project-based pricing with options for scope. Social clips can start under $1k; multi-location shoots may exceed $10k.
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
                <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
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
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Let's work together, <span className="text-amber-400">{firstName}</span>
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            We're excited to show {companyName} what's possible. Get started in minutes.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Let's make <span className="text-amber-500">{companyName}</span> the obvious choice
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Book a quick brainstorm with a senior producer. We'll scope ideas, timelines, and budget in one call.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Phone className="w-4 h-4" />
              Book a call
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
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kicker Video. Professional video production.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WineVideoTemplate;
