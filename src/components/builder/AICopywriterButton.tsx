import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface AICopywriterButtonProps {
  text: string;
  sectionType: string;
  onRewrite: (newText: string) => void;
}

const AICopywriterButton = ({ text, sectionType, onRewrite }: AICopywriterButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [editedSuggestion, setEditedSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRewrite = async () => {
    if (!text.trim()) {
      toast({ title: "No text to rewrite", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSuggestion(null);
    setIsEditing(false);
    setOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite-copy", {
        body: { text, sectionType, tone: "professional" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.rewritten) {
        setSuggestion(data.rewritten);
        setEditedSuggestion(data.rewritten);
      }
    } catch (err: any) {
      toast({ title: "Rewrite failed", description: err.message, variant: "destructive" });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    const finalText = isEditing ? editedSuggestion : suggestion;
    if (finalText) {
      onRewrite(finalText);
      toast({ title: "Copy updated!" });
    }
    setSuggestion(null);
    setOpen(false);
    setIsEditing(false);
  };

  const handleReject = () => {
    setSuggestion(null);
    setOpen(false);
    setIsEditing(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={handleRewrite}
              disabled={loading || !text.trim()}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-primary" />}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Improve with AI</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 p-3" align="end" side="bottom">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating suggestion…
          </div>
        )}
        {suggestion && !isEditing && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">AI Suggestion:</p>
            <p className="text-sm leading-relaxed border rounded-md p-2 bg-muted/50">{suggestion}</p>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleReject}>
                <X className="w-3 h-3 mr-1" /> Discard
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleAccept}>
                <Check className="w-3 h-3 mr-1" /> Apply
              </Button>
            </div>
          </div>
        )}
        {suggestion && isEditing && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Edit suggestion:</p>
            <Textarea
              value={editedSuggestion}
              onChange={(e) => setEditedSuggestion(e.target.value)}
              className="text-sm min-h-[80px]"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
                Back
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleAccept}>
                <Check className="w-3 h-3 mr-1" /> Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AICopywriterButton;
