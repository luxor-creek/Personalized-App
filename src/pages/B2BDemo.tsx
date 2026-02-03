import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoPlayer from "@/components/VideoPlayer";
import kickerLogo from "@/assets/kicker-logo.png";
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
  Clock,
  MapPin,
  ShieldCheck,
  Send,
  Film,
  Calendar
} from "lucide-react";
import { useState } from "react";

const B2BDemo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    company: "",
    primaryGoal: "",
    timeline: "",
    projectDetails: ""
  });

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToContact}
            className="border-amber-600 text-amber-700 hover:bg-amber-50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book a call
          </Button>
          <div className="flex items-center gap-2">
            <img src={kickerLogo} alt="Kicker Video" className="h-8" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 rounded-full text-amber-800 text-sm font-medium mb-8">
              <Film className="w-4 h-4" />
              Kicker Video — B2B Video Production
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Product Demo, Sharpened for Decision‑Makers
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Built for marketing and product leaders who need a clear, on‑brand story. AI video is here — but it's not ready to produce your B2B demos on its own. Wouldn't it be nice to have a senior creative manage the process for you? See how we turn complex ideas into a 90–120s demo that converts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={scrollToContact}
                className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-6"
              >
                <Play className="w-4 h-4 mr-2" />
                Book a 15‑min strategy call
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToPricing}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Get pricing
              </Button>
            </div>

            {/* Video Player */}
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <VideoPlayer videoId="76979871" />
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
          <img 
            src={clientLogos} 
            alt="Client logos" 
            className="max-w-2xl mx-auto opacity-60 grayscale hover:grayscale-0 transition-all"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Clarity, speed, and on‑brand delivery
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              We blend senior creative teams with AI‑assisted tooling to cut timelines and keep costs predictable. From kickoff to final cut, our process is built for busy B2B teams.
            </p>

            {/* Check List */}
            <div className="space-y-4 mb-12">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-semibold">Script to screen in weeks, not months.</span> Detailed pre‑pro and rapid iteration.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-semibold">On‑brand, on‑budget.</span> Clear scopes; no surprises.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-semibold">Local crews in 21 cities.</span> Lower travel costs across US & Canada.
                </p>
              </div>
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
              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader>
                  <Route className="w-8 h-8 text-amber-500 mb-2" />
                  <CardTitle className="text-xl">A guided process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Kickoff, creative brief, pre‑pro, production, post. Aligned and transparent at every step.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader>
                  <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
                  <CardTitle className="text-xl">AI‑assisted efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Faster scripting, storyboards, and revisions without sacrificing quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader>
                  <Target className="w-8 h-8 text-amber-500 mb-2" />
                  <CardTitle className="text-xl">Outcomes that convert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Sales‑ready demos, explainer videos, and launch assets your team can deploy fast.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader>
                  <Handshake className="w-8 h-8 text-amber-500 mb-2" />
                  <CardTitle className="text-xl">Seamless collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We plug into your workflow with timely check‑ins and clear revision windows.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              What B2B teams say
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              Marketing, product, and comms leaders across tech, healthcare, energy, and manufacturing.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-gray-300 mb-4" />
                  <blockquote className="text-gray-700 mb-4">
                    "They distilled our complex platform into a crisp, 2‑minute demo that our sales team uses daily."
                  </blockquote>
                  <p className="text-sm text-gray-500 font-medium">
                    VP Marketing, SaaS
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-gray-300 mb-4" />
                  <blockquote className="text-gray-700 mb-4">
                    "Fast, organized, and on brand. The process was seamless even across two locations."
                  </blockquote>
                  <p className="text-sm text-gray-500 font-medium">
                    Director of Product Marketing, Healthcare
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-gray-300 mb-4" />
                  <blockquote className="text-gray-700 mb-4">
                    "Great value for the quality. Clear scope and quick iterations saved us weeks."
                  </blockquote>
                  <p className="text-sm text-gray-500 font-medium">
                    Head of Comms, Manufacturing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Project‑based pricing
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              Every project is scoped to your needs. Typical ranges shown below.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Tier 1 */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Social & cut‑downs</CardTitle>
                  <p className="text-sm text-gray-500">Short‑form assets, repurposed edits</p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 mb-4">From &lt;$1k</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      :15–:45 edits • captions • thumbnails
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Fast turnaround
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300"
                    onClick={scrollToContact}
                  >
                    Request scope
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Tier 2 - Featured */}
              <Card className="border-amber-300 bg-amber-50/50 ring-2 ring-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg">Product demo / explainer</CardTitle>
                  <p className="text-sm text-gray-500">90–120s primary asset + cut‑downs</p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 mb-4">$3k–$8k</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Script, storyboard, VO/music
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Animation or live‑action
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900"
                    onClick={scrollToContact}
                  >
                    Start your demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Tier 3 */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Multi‑location shoot</CardTitle>
                  <p className="text-sm text-gray-500">Crews in 21 cities to reduce travel</p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 mb-4">$8k–$25k</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Producer + crew + gear
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Full post‑production
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      Price depends on # of locations
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300"
                    onClick={scrollToContact}
                  >
                    Get a quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Work/Portfolio CTA Section */}
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
                className="border-amber-600 text-amber-700 hover:bg-amber-50"
                onClick={scrollToContact}
              >
                <Download className="w-4 h-4 mr-2" />
                Get a sample brief
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Ready to plan your demo?
            </h2>
            <p className="text-lg text-gray-600 text-center mb-8">
              Tell us about your audience, goals, and deadline. We'll return with a simple plan, scope, and timeline.
            </p>

            {/* Info badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                Typical timeline: 2–3 weeks (demo), 3–6 weeks (live action)
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                Crews in 21 cities across US & Canada
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Clear scopes with locked budgets
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <a 
                href="mailto:hello@kickervideo.com" 
                className="flex items-center gap-2 text-gray-900 hover:text-amber-600 font-medium"
              >
                <Mail className="w-5 h-5" />
                hello@kickervideo.com
              </a>
              <a 
                href="tel:+18005551234" 
                className="flex items-center gap-2 text-gray-600 hover:text-amber-600"
              >
                <Phone className="w-5 h-5" />
                (800) 555‑1234
              </a>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
              <Input 
                placeholder="Full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="bg-white border-gray-300"
              />
              <Input 
                type="email"
                placeholder="Work email"
                value={formData.workEmail}
                onChange={(e) => setFormData({...formData, workEmail: e.target.value})}
                className="bg-white border-gray-300"
              />
              <Input 
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="bg-white border-gray-300"
              />
              <Select 
                value={formData.primaryGoal} 
                onValueChange={(value) => setFormData({...formData, primaryGoal: value})}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product-demo">Product demo</SelectItem>
                  <SelectItem value="explainer-video">Explainer video</SelectItem>
                  <SelectItem value="brand-video">Brand video</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="trade-show">Trade show asset</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                className="bg-white border-gray-300"
              />
              <Textarea 
                placeholder="Project details"
                value={formData.projectDetails}
                onChange={(e) => setFormData({...formData, projectDetails: e.target.value})}
                className="bg-white border-gray-300 min-h-[120px]"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send inquiry
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kicker Video. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default B2BDemo;
