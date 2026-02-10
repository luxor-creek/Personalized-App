import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink, Settings2, Plus, Pencil, Trash2, Check, Code, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationField {
  key: string;
  label: string;
  type: "text" | "textarea" | "password";
  placeholder: string;
  helpText?: string;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  logo?: string;
  docsUrl?: string;
  fields: IntegrationField[];
  isCustom?: boolean;
}

const BUILT_IN_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "tolt",
    name: "Tolt",
    description: "Affiliate & referral program management with automated payouts via PayPal, Wise, or wire transfer.",
    docsUrl: "https://help.tolt.com/en/articles/6843411-how-to-set-up-stripe-with-tolt",
    fields: [
      { key: "tolt_script", label: "Tracking Script", type: "textarea", placeholder: '<script src="https://cdn.tolt.io/tolt.js" data-tolt="YOUR-ID"></script>', helpText: "Paste the Tolt tracking script from your Tolt dashboard → Settings → Install." },
      { key: "tolt_api_key", label: "API Key", type: "password", placeholder: "tolt_live_...", helpText: "Found in Tolt → Settings → API Keys." },
      { key: "tolt_webhook_url", label: "Webhook URL (outgoing)", type: "text", placeholder: "https://api.tolt.io/webhook/...", helpText: "Webhook endpoint for sending conversion events to Tolt." },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing for subscriptions and one-time charges.",
    docsUrl: "https://stripe.com/docs",
    fields: [
      { key: "stripe_publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_..." },
      { key: "stripe_webhook_secret", label: "Webhook Signing Secret", type: "password", placeholder: "whsec_...", helpText: "Found in Stripe → Developers → Webhooks → Signing secret." },
    ],
  },
  {
    id: "resend",
    name: "Resend",
    description: "Transactional email delivery for welcome emails, trial reminders, and notifications.",
    docsUrl: "https://resend.com/docs",
    fields: [
      { key: "resend_api_key", label: "API Key", type: "password", placeholder: "re_..." },
      { key: "resend_from_email", label: "From Email", type: "text", placeholder: "hello@yourdomain.com" },
    ],
  },
  {
    id: "snov",
    name: "Snov.io",
    description: "Email outreach and lead generation campaigns with list management.",
    docsUrl: "https://snov.io/knowledgebase",
    fields: [
      { key: "snov_user_id", label: "User ID", type: "text", placeholder: "Your Snov.io user ID" },
      { key: "snov_secret", label: "API Secret", type: "password", placeholder: "Your Snov.io API secret" },
    ],
  },
];

const STORAGE_KEY = "admin_integrations_config";
const CUSTOM_INTEGRATIONS_KEY = "admin_custom_integrations";

function loadSavedConfig(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConfig(config: Record<string, Record<string, string>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadCustomIntegrations(): IntegrationConfig[] {
  try {
    const raw = localStorage.getItem(CUSTOM_INTEGRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomIntegrations(integrations: IntegrationConfig[]) {
  localStorage.setItem(CUSTOM_INTEGRATIONS_KEY, JSON.stringify(integrations));
}

export default function IntegrationsPanel() {
  const { toast } = useToast();
  const [savedConfigs, setSavedConfigs] = useState<Record<string, Record<string, string>>>(loadSavedConfig);
  const [customIntegrations, setCustomIntegrations] = useState<IntegrationConfig[]>(loadCustomIntegrations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add custom integration state
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDocsUrl, setNewDocsUrl] = useState("");
  const [newFields, setNewFields] = useState<IntegrationField[]>([
    { key: "", label: "", type: "text", placeholder: "" },
  ]);

  const allIntegrations = [...BUILT_IN_INTEGRATIONS, ...customIntegrations];
  const BACKEND_CONNECTED = new Set(["snov", "resend"]);

  const isConnected = (id: string) => {
    if (BACKEND_CONNECTED.has(id)) return true;
    const cfg = savedConfigs[id];
    return cfg && Object.values(cfg).some((v) => v.trim().length > 0);
  };

  const openEdit = (integration: IntegrationConfig) => {
    setEditingId(integration.id);
    setFormValues(savedConfigs[integration.id] || {});
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingId) return;
    const updated = { ...savedConfigs, [editingId]: { ...formValues } };
    setSavedConfigs(updated);
    saveConfig(updated);
    setEditDialogOpen(false);
    setEditingId(null);
    toast({ title: "Integration saved", description: "Configuration updated successfully." });
  };

  const handleDisconnect = (id: string) => {
    const updated = { ...savedConfigs };
    delete updated[id];
    setSavedConfigs(updated);
    saveConfig(updated);
    toast({ title: "Integration removed", description: "Configuration cleared." });
  };

  const handleDeleteCustom = (id: string) => {
    const updatedCustom = customIntegrations.filter((i) => i.id !== id);
    setCustomIntegrations(updatedCustom);
    saveCustomIntegrations(updatedCustom);
    // Also remove saved config
    const updatedConfigs = { ...savedConfigs };
    delete updatedConfigs[id];
    setSavedConfigs(updatedConfigs);
    saveConfig(updatedConfigs);
    toast({ title: "Integration deleted", description: "Custom integration removed." });
  };

  // Custom integration field management
  const addField = () => {
    setNewFields((prev) => [...prev, { key: "", label: "", type: "text", placeholder: "" }]);
  };

  const removeField = (index: number) => {
    setNewFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<IntegrationField>) => {
    setNewFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const handleCreateCustom = () => {
    if (!newName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const validFields = newFields
      .filter((f) => f.label.trim())
      .map((f) => ({
        ...f,
        key: f.key || f.label.toLowerCase().replace(/\s+/g, "_"),
      }));

    if (validFields.length === 0) {
      toast({ title: "Add at least one field", variant: "destructive" });
      return;
    }

    const id = `custom_${Date.now()}`;
    const newIntegration: IntegrationConfig = {
      id,
      name: newName.trim(),
      description: newDescription.trim() || `Custom integration for ${newName.trim()}.`,
      docsUrl: newDocsUrl.trim() || undefined,
      fields: validFields,
      isCustom: true,
    };

    const updatedCustom = [...customIntegrations, newIntegration];
    setCustomIntegrations(updatedCustom);
    saveCustomIntegrations(updatedCustom);
    setAddCustomOpen(false);
    resetCustomForm();
    toast({ title: "Integration added", description: `${newName} is ready to configure.` });
  };

  const resetCustomForm = () => {
    setNewName("");
    setNewDescription("");
    setNewDocsUrl("");
    setNewFields([{ key: "", label: "", type: "text", placeholder: "" }]);
  };

  const currentIntegration = allIntegrations.find((i) => i.id === editingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys, tracking scripts, and webhook URLs for third-party services.
          </p>
        </div>
        <Button onClick={() => { resetCustomForm(); setAddCustomOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Integration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allIntegrations.map((integration) => {
          const connected = isConnected(integration.id);
          return (
            <div
              key={integration.id}
              className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Code className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      {integration.isCustom && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">Custom</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <Badge variant={connected ? "default" : "secondary"} className="shrink-0">
                  {connected ? (
                    <><Check className="w-3 h-3 mr-1" />Connected</>
                  ) : (
                    "Not configured"
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
                {connected ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => openEdit(integration)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                    </Button>
                    {!BACKEND_CONNECTED.has(integration.id) && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDisconnect(integration.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />Remove
                      </Button>
                    )}
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => openEdit(integration)}>
                    <Settings2 className="w-3.5 h-3.5 mr-1.5" />Configure
                  </Button>
                )}
                {integration.isCustom && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCustom(integration.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                  </Button>
                )}
                {integration.docsUrl && (
                  <Button size="sm" variant="ghost" asChild className="ml-auto">
                    <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />Docs
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Configure Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentIntegration ? `Configure ${currentIntegration.name}` : "Configure Integration"}
            </DialogTitle>
            <DialogDescription>
              {currentIntegration?.description}
            </DialogDescription>
          </DialogHeader>

          {currentIntegration && (
            <div className="space-y-4 pt-2">
              {currentIntegration.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-muted-foreground">{field.helpText}</p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Configuration</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Custom Integration Dialog */}
      <Dialog open={addCustomOpen} onOpenChange={setAddCustomOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Custom Integration</DialogTitle>
            <DialogDescription>
              Define a new third-party service with the fields you need to store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="custom-name">Service Name *</Label>
              <Input
                id="custom-name"
                placeholder="e.g. Zapier, HubSpot, Intercom"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-desc">Description</Label>
              <Input
                id="custom-desc"
                placeholder="What does this integration do?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-docs">Documentation URL</Label>
              <Input
                id="custom-docs"
                placeholder="https://docs.example.com"
                value={newDocsUrl}
                onChange={(e) => setNewDocsUrl(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Configuration Fields *</Label>
                <Button size="sm" variant="outline" onClick={addField}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add Field
                </Button>
              </div>

              {newFields.map((field, index) => (
                <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Field {index + 1}</span>
                    {newFields.length > 1 && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => removeField(index)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Label (e.g. API Key)"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                    />
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateField(index, { type: v as IntegrationField["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="password">Password / Secret</SelectItem>
                        <SelectItem value="textarea">Multi-line / Script</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Placeholder text (optional)"
                    value={field.placeholder}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddCustomOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCustom}>Create Integration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
