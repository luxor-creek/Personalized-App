import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AICopywriterButtonProps {
  text: string;
  sectionType: string;
  onRewrite: (newText: string) => void;
}

const AICopywriterButton = ({ text, sectionType, onRewrite }: AICopywriterButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    if (!text.trim()) {
      toast({ title: "No text to rewrite", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite-copy", {
        body: { text, sectionType, tone: "professional" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.rewritten) {
        onRewrite(data.rewritten);
        toast({ title: "Copy improved!" });
      }
    } catch (err: any) {
      toast({ title: "Rewrite failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 shrink-0"
          onClick={handleRewrite}
          disabled={loading || !text.trim()}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-primary" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Improve with AI</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AICopywriterButton;
