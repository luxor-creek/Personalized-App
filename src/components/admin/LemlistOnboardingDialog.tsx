import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Check, ExternalLink, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LemlistOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

export default function LemlistOnboardingDialog({ open, onOpenChange, onConnected }: LemlistOnboardingDialogProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [existingKey, setExistingKey] = useState(false);

  useEffect(() => {
    if (open) {
      // Check if user already has a key saved
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("integration_credentials" as any)
          .select("credentials")
          .eq("user_id", user.id)
          .eq("provider", "lemlist")
          .maybeSingle();
        if ((data as any)?.credentials?.api_key) {
          setApiKey((data as any).credentials.api_key);
          setExistingKey(true);
        }
      })();
    } else {
      setApiKey("");
      setShowKey(false);
      setTestResult(null);
      setExistingKey(false);
    }
  }, [open]);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Save first, then test via the edge function
      await handleSave(true);
      const { data, error } = await supabase.functions.invoke("lemlist-get-campaigns");
      if (error || data?.error) throw new Error(data?.error || "Connection failed");
      setTestResult("success");
      toast({ title: "Connected!", description: `Found ${data.campaigns?.length || 0} campaigns in your LemList account.` });
    } catch {
      setTestResult("error");
      toast({ title: "Connection failed", description: "Check your API key and try again.", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("integration_credentials" as any)
        .upsert({
          user_id: user.id,
          provider: "lemlist",
          credentials: { api_key: apiKey.trim() },
        } as any, { onConflict: "user_id,provider" });

      if (error) throw error;

      if (!silent) {
        toast({ title: "API key saved" });
        onConnected?.();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("integration_credentials" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "lemlist");
    setApiKey("");
    setExistingKey(false);
    setTestResult(null);
    toast({ title: "LemList disconnected" });
    onConnected?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Connect LemList
          </DialogTitle>
          <DialogDescription>
            Link your LemList account to export prospects directly into your outreach campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Step-by-step instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">How to find your API key:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Log in to your <a href="https://app.lemlist.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">LemList account</a></li>
              <li>Click your profile picture (bottom-left) → <strong>Settings</strong></li>
              <li>Go to <strong>Integrations</strong> in the left sidebar</li>
              <li>Find the <strong>API</strong> section and click <strong>Generate</strong> (or copy your existing key)</li>
              <li>Paste the key below</li>
            </ol>
            <a
              href="https://help.lemlist.com/en/articles/9487910-how-to-find-my-api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View LemList help article
            </a>
          </div>

          {/* API Key input */}
          <div className="space-y-1.5">
            <Label htmlFor="lemlist-api-key">API Key</Label>
            <div className="relative">
              <Input
                id="lemlist-api-key"
                type={showKey ? "text" : "password"}
                placeholder="Paste your LemList API key here"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test result badge */}
          {testResult && (
            <div className="flex items-center gap-2">
              <Badge variant={testResult === "success" ? "default" : "destructive"}>
                {testResult === "success" ? (
                  <><Check className="w-3 h-3 mr-1" />Connected</>
                ) : (
                  "Connection failed"
                )}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {existingKey && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTest} disabled={!apiKey.trim() || testing}>
                {testing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                Test Connection
              </Button>
              <Button onClick={() => handleSave(false)} disabled={!apiKey.trim() || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                {existingKey ? "Update Key" : "Save & Connect"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
