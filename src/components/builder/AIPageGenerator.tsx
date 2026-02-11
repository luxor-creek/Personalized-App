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
}

const AIPageGenerator = ({ onGenerate }: AIPageGeneratorProps) => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Generate with AI</span>
        </Button>
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
            placeholder="Example: I run a video production company that creates personalized recruitment videos for police departments. I want a page to pitch my services to potential clients."
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
