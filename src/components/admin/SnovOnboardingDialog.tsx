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

interface SnovOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

export default function SnovOnboardingDialog({ open, onOpenChange, onConnected }: SnovOnboardingDialogProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [existingKey, setExistingKey] = useState(false);

  useEffect(() => {
    if (open) {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("integration_credentials" as any)
          .select("credentials")
          .eq("user_id", user.id)
          .eq("provider", "snov")
          .maybeSingle();
        if ((data as any)?.credentials?.user_id) {
          setUserId((data as any).credentials.user_id);
          setSecret((data as any).credentials.secret);
          setExistingKey(true);
        }
      })();
    } else {
      setUserId("");
      setSecret("");
      setShowSecret(false);
      setTestResult(null);
      setExistingKey(false);
    }
  }, [open]);

  const handleTest = async () => {
    if (!userId.trim() || !secret.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      await handleSave(true);
      const { data, error } = await supabase.functions.invoke("snov-get-lists");
      if (error || data?.error) throw new Error(data?.error || "Connection failed");
      setTestResult("success");
      toast({ title: "Connected!", description: `Found ${data.lists?.length || 0} prospect lists in your Snov.io account.` });
    } catch {
      setTestResult("error");
      toast({ title: "Connection failed", description: "Check your User ID and Secret, then try again.", variant: "destructive" });
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
          provider: "snov",
          credentials: { user_id: userId.trim(), secret: secret.trim() },
        } as any, { onConflict: "user_id,provider" });

      if (error) throw error;

      if (!silent) {
        toast({ title: "Snov.io credentials saved" });
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
      .eq("provider", "snov");
    setUserId("");
    setSecret("");
    setExistingKey(false);
    setTestResult(null);
    toast({ title: "Snov.io disconnected" });
    onConnected?.();
  };

  const hasBothFields = userId.trim().length > 0 && secret.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Connect Snov.io
          </DialogTitle>
          <DialogDescription>
            Link your Snov.io account to enrich prospects and manage outreach campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Step-by-step instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">How to find your API credentials:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Log in to your <a href="https://app.snov.io" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">Snov.io account</a></li>
              <li>Click your avatar (top-right) → <strong>Account Settings</strong></li>
              <li>Go to the <strong>API</strong> tab in the left sidebar</li>
              <li>Copy your <strong>User ID</strong> and <strong>API Secret</strong></li>
              <li>Paste both values below</li>
            </ol>
            <a
              href="https://snov.io/knowledgebase/what-is-snov-io-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View Snov.io API documentation
            </a>
          </div>

          {/* User ID input */}
          <div className="space-y-1.5">
            <Label htmlFor="snov-user-id">User ID</Label>
            <Input
              id="snov-user-id"
              type="text"
              placeholder="Paste your Snov.io User ID here"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setTestResult(null); }}
            />
          </div>

          {/* Secret input */}
          <div className="space-y-1.5">
            <Label htmlFor="snov-secret">API Secret</Label>
            <div className="relative">
              <Input
                id="snov-secret"
                type={showSecret ? "text" : "password"}
                placeholder="Paste your Snov.io API Secret here"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setTestResult(null); }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <Button variant="outline" onClick={handleTest} disabled={!hasBothFields || testing}>
                {testing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                Test Connection
              </Button>
              <Button onClick={() => handleSave(false)} disabled={!hasBothFields || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                {existingKey ? "Update Credentials" : "Save & Connect"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
