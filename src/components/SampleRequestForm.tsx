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
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SampleRequestForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    audienceType: "",
    videoVolume: "",
    productUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.productUrl) {
      toast({
        title: "Missing required fields",
        description: "Please fill in your name, company, and product URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(formData.productUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with https://",
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
        description: "We'll generate your sample video and get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        company: "",
        role: "",
        audienceType: "",
        videoVolume: "",
        productUrl: "",
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
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left side - Info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary mb-4">
              GET STARTED
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Request a Sample Video
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              See what Viaxo can do with your content. We'll generate a sample video from your existing page—no creative brief required.
            </p>

            <div className="space-y-8">
              {[
                { 
                  number: 1, 
                  title: "Submit your URL", 
                  description: "Share a product or service page you'd like converted." 
                },
                { 
                  number: 2, 
                  title: "We generate a sample", 
                  description: "Using our standard template, we'll create a sample video." 
                },
                { 
                  number: 3, 
                  title: "Review and decide", 
                  description: "No obligation. See if Viaxo fits your needs." 
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
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Company</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Input
                    id="role"
                    placeholder="Your role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audienceType" className="text-foreground">Audience Type</Label>
                  <Select 
                    value={formData.audienceType} 
                    onValueChange={(value) => setFormData({ ...formData, audienceType: value })}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b">B2B</SelectItem>
                      <SelectItem value="b2c">B2C</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoVolume" className="text-foreground">Estimated Video Volume</Label>
                <Select 
                  value={formData.videoVolume} 
                  onValueChange={(value) => setFormData({ ...formData, videoVolume: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 videos</SelectItem>
                    <SelectItem value="11-50">11-50 videos</SelectItem>
                    <SelectItem value="51-100">51-100 videos</SelectItem>
                    <SelectItem value="100+">100+ videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productUrl" className="text-foreground">URL or CSV Upload</Label>
                <Input
                  id="productUrl"
                  placeholder="https://yoursite.com/product"
                  value={formData.productUrl}
                  onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={500}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 gap-2"
                  disabled
                >
                  <Upload className="w-4 h-4" />
                  Or upload CSV
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Generate My Sample"}
              </Button>

              <p className="text-center text-muted-foreground text-sm">
                Sample generated from your existing page. No creative brief required.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleRequestForm;
