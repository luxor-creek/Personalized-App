import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BuilderSection } from "@/types/builder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIPageGeneratorProps {
  onGenerate: (sections: BuilderSection[]) => void;
  inline?: boolean;
}

const AIPageGenerator = ({ onGenerate, inline }: AIPageGeneratorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-page", {
        body: { prompt: prompt.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.sections || !Array.isArray(data.sections)) {
        throw new Error("Invalid response from AI");
      }
      onGenerate(data.sections);
      toast({ title: "Page generated!", description: `${data.sections.length} sections created` });
      setOpen(false);
      setPrompt("");
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const triggerButton = inline ? (
    <button
      className="group flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all w-64"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <span className="text-base font-semibold text-foreground">Generate with AI</span>
      <span className="text-xs text-muted-foreground text-center">Describe your page and AI builds it for you</span>
    </button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <Sparkles className="w-4 h-4" />
      <span className="hidden sm:inline">Generate with AI</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Page with AI
          </DialogTitle>
          <DialogDescription>
            Describe your business or page purpose and AI will create a full landing page layout with sections, copy, and styling.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to create a personalized page to send to prospects for my recruitment firm. This page will feature an offer and a contact form."
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Page"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPageGenerator;
