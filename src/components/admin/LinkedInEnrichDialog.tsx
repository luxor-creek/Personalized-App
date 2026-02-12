import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Linkedin, Search, Plus, User, Building2, Mail, Briefcase } from "lucide-react";

interface EnrichedContact {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string;
  photo_url: string;
  linkedin_url: string;
}

interface Props {
  campaignId: string;
  templateId: string | null;
  onContactAdded: () => void;
}

export default function LinkedInEnrichDialog({ campaignId, templateId, onContactAdded }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [searching, setSearching] = useState(false);
  const [contact, setContact] = useState<EnrichedContact | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLinkedinUrl("");
    setContact(null);
    setError(null);
    setSearching(false);
    setAdding(false);
  };

  const handleSearch = async () => {
    if (!linkedinUrl.trim()) return;
    if (!linkedinUrl.includes("linkedin.com")) {
      setError("Please enter a valid LinkedIn profile URL");
      return;
    }

    setSearching(true);
    setError(null);
    setContact(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("snov-enrich-linkedin", {
        body: { linkedin_url: linkedinUrl.trim() },
      });

      if (res.error) throw new Error(res.error.message || "Enrichment failed");
      
      const result = res.data;
      if (!result.success || !result.contact) {
        throw new Error(result.error || "No contact data found");
      }

      setContact(result.contact);
    } catch (err: any) {
      setError(err.message || "Failed to enrich contact");
    } finally {
      setSearching(false);
    }
  };

  const handleAddToCampaign = async () => {
    if (!contact) return;
    setAdding(true);

    try {
      const { data, error: insertError } = await supabase
        .from("personalized_pages")
        .insert({
          campaign_id: campaignId,
          template_id: templateId,
          first_name: contact.first_name || "Unknown",
          last_name: contact.last_name || null,
          email: contact.email || null,
          company: contact.company || null,
          photo_url: contact.photo_url || null,
        } as any)
        .select("token")
        .single();

      if (insertError) throw insertError;

      const pageUrl = `${window.location.origin}/view/${data.token}`;
      navigator.clipboard.writeText(pageUrl);

      toast({
        title: "Contact added!",
        description: `${contact.first_name} ${contact.last_name} added — link copied to clipboard.`,
      });

      onContactAdded();
      reset();
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Linkedin className="w-4 h-4 mr-2" />
          Quick Add from LinkedIn
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5" />
            Quick Add from LinkedIn
          </DialogTitle>
          <DialogDescription>
            Pull contact details from LinkedIn via Snov.io to create their personalized page faster.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="linkedin-url"
                placeholder="https://linkedin.com/in/name"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={searching}
              />
              <Button onClick={handleSearch} disabled={searching || !linkedinUrl.trim()}>
                {searching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {searching && (
            <div className="bg-muted rounded-xl p-6 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted-foreground/20 rounded w-2/3" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">Enriching contact from Snov.io…</p>
            </div>
          )}

          {/* Error state */}
          {error && !searching && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different LinkedIn URL.</p>
            </div>
          )}

          {/* Result card */}
          {contact && !searching && (
            <div className="bg-muted rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                {contact.photo_url ? (
                  <img src={contact.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground text-lg">
                    {contact.first_name} {contact.last_name}
                  </h4>
                  {contact.job_title && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {contact.job_title}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {contact.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{contact.company}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.linkedin_url && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground truncate">
                      {contact.linkedin_url}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={handleAddToCampaign} className="flex-1" disabled={adding}>
                  {adding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Campaign
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
