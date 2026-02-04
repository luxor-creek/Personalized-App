import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SampleRequestFormProps = {
  title?: string;
  subtitle?: string;
};

const SampleRequestForm = ({ title, subtitle }: SampleRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    primaryGoal: "",
    timeline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.email || !formData.company || !formData.primaryGoal || !formData.timeline) {
      toast({
        title: "Missing required fields",
        description: "Please fill in First Name, Email, Company, Primary Goal, and Timeline.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-sample-request", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Request submitted!",
        description: "We'll be in touch with you soon.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        primaryGoal: "",
        timeline: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left side - Info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary mb-4">
              GET STARTED
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {title || "Request a Sample Video"}
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              {subtitle ||
                "See what Viaxo can do with your content. We'll generate a sample video from your existing page—no creative brief required."}
            </p>

            <div className="space-y-8">
              {[
                { 
                  number: 1, 
                  title: "Submit your request", 
                  description: "Tell us about your project and timeline." 
                },
                { 
                  number: 2, 
                  title: "We reach out", 
                  description: "Our team will contact you to discuss details." 
                },
                { 
                  number: 3, 
                  title: "Get your video", 
                  description: "Receive a professional video tailored to your needs." 
                },
              ].map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryGoal" className="text-foreground">
                  Primary Goal <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.primaryGoal} 
                  onValueChange={(value) => setFormData({ ...formData, primaryGoal: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training-video">Training Video</SelectItem>
                    <SelectItem value="executive-message">Executive Message</SelectItem>
                    <SelectItem value="social-media-video">Social Media Video</SelectItem>
                    <SelectItem value="quick-location-shoot">Quick Location Shoot</SelectItem>
                    <SelectItem value="brand-video">Brand Video</SelectItem>
                    <SelectItem value="explainer-video">Explainer Video</SelectItem>
                    <SelectItem value="animated-video">Animated Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-foreground">
                  Timeline <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.timeline} 
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select your timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="next-week">Next Week</SelectItem>
                    <SelectItem value="next-month">Next Month</SelectItem>
                    <SelectItem value="no-rush">No Rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>

              <p className="text-center text-muted-foreground text-sm">
                We'll get back to you in 30 mins or less.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleRequestForm;
