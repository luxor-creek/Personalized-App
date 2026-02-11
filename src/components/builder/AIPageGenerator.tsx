import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Upload, Globe, FileText } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIPageGeneratorProps {
  onGenerate: (sections: BuilderSection[]) => void;
  inline?: boolean;
}

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/csv,.doc,.docx";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AIPageGenerator = ({ onGenerate, inline }: AIPageGeneratorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPrompt("");
    setUrl("");
    setFile(null);
    setGenerating(false);
    setActiveTab("prompt");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max file size is 10MB", variant: "destructive" });
      return;
    }
    setFile(selected);
  };

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:xxx;base64, prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  // Generate from text prompt
  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-page", {
        body: { prompt: prompt.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.sections || !Array.isArray(data.sections)) throw new Error("Invalid response from AI");
      onGenerate(data.sections);
      toast({ title: "Page generated!", description: `${data.sections.length} sections created` });
      setOpen(false);
      resetState();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Generate from URL
  const handleGenerateFromUrl = async () => {
    if (!url.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-from-url", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.sections || !Array.isArray(data.sections)) throw new Error("Invalid response from AI");
      onGenerate(data.sections);
      toast({ title: "Page cloned!", description: `${data.sections.length} sections created from URL` });
      setOpen(false);
      resetState();
    } catch (err: any) {
      toast({ title: "Clone failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Generate from file upload
  const handleGenerateFromFile = async () => {
    if (!file) return;
    setGenerating(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("ai-generate-from-file", {
        body: { fileBase64: base64, fileType: file.type, fileName: file.name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.sections || !Array.isArray(data.sections)) throw new Error("Invalid response from AI");
      onGenerate(data.sections);
      toast({ title: "Page generated!", description: `${data.sections.length} sections created from ${file.name}` });
      setOpen(false);
      resetState();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (activeTab === "prompt") handleGenerateFromPrompt();
    else if (activeTab === "url") handleGenerateFromUrl();
    else if (activeTab === "file") handleGenerateFromFile();
  };

  const isDisabled = generating || (
    activeTab === "prompt" ? !prompt.trim() :
    activeTab === "url" ? !url.trim() :
    !file
  );

  const triggerButton = inline ? (
    <button
      className="group flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all w-64"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <span className="text-base font-semibold text-foreground">Generate with AI</span>
      <span className="text-xs text-muted-foreground text-center">Describe, upload, or paste a URL</span>
    </button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <Sparkles className="w-4 h-4" />
      <span className="hidden sm:inline">Generate with AI</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
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
            Describe your page. Or select another option here.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt" className="gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Describe
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-1.5 text-xs sm:text-sm">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="w-3.5 h-3.5" />
              Clone URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: I want to create a personalized page to send to prospects for my recruitment firm. This page will feature an offer and a contact form."
              rows={5}
              className="resize-none"
            />
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-primary" />
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB • Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">Images (PNG, JPG), PDFs, or text documents • Max 10MB</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a screenshot of an existing page, a PDF brochure, or any document — AI will create a landing page from it.
            </p>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/landing-page"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Paste any landing page URL and AI will scrape the content, analyze the layout, and recreate it as an editable page.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => { setOpen(false); resetState(); }}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isDisabled} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." :
              activeTab === "url" ? "Clone Page" :
              activeTab === "file" ? "Generate from File" :
              "Generate Page"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPageGenerator;
