import { useState } from "react";
import { Braces, Copy, ChevronDown, ChevronRight, Plus, ArrowLeft, Globe, Lock, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCustomVariables, SYSTEM_VARIABLES } from "@/hooks/useCustomVariables";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type View = "collapsed" | "list" | "manage";

const BuilderVariablesPanel = () => {
  const { variables, allVariables, loading, createVariable, updateVariable, deleteVariable } = useCustomVariables();
  const { toast } = useToast();

  const [view, setView] = useState<View>("collapsed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formFallback, setFormFallback] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied!", description: token });
  };

  const resetForm = () => { setFormName(""); setFormToken(""); setFormFallback(""); setEditingId(null); setShowAddForm(false); };

  const handleSave = async () => {
    if (!formName.trim() || !formToken.trim()) {
      toast({ title: "Name and token required", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateVariable(editingId, { name: formName.trim(), token: formToken.trim(), fallback_value: formFallback.trim() });
        toast({ title: "Updated" });
      } else {
        await createVariable(formName.trim(), formToken.trim(), formFallback.trim());
        toast({ title: "Variable created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVariable(deleteId);
      toast({ title: "Variable deleted" });
      setDeleteId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (v: { id: string; name: string; token: string; fallback_value?: string | null }) => {
    setEditingId(v.id);
    setFormName(v.name);
    setFormToken(v.token.replace(/^\{\{|\}\}$/g, ""));
    setFormFallback(v.fallback_value || "");
    setShowAddForm(true);
  };

  const allRows = [
    ...SYSTEM_VARIABLES.map((v) => ({ id: v.token, name: v.name, token: v.token, fallback_value: null, isSystem: true })),
    ...variables.map((v) => ({ id: v.id, name: v.name, token: v.token, fallback_value: v.fallback_value, isSystem: false })),
  ];

  // Collapsed state — just a clickable header
  if (view === "collapsed") {
    return (
      <button
        className="w-full border-b border-border px-3 py-2.5 flex items-center justify-between hover:bg-accent/50 transition-colors"
        onClick={() => setView("list")}
      >
        <div className="flex items-center gap-1.5">
          <Braces className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Variables</span>
          <span className="text-[10px] text-muted-foreground">({allVariables.length})</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    );
  }

  // List view — quick reference with click-to-copy + Manage button
  if (view === "list") {
    return (
      <div className="border-b border-border">
        <button
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-accent/50 transition-colors"
          onClick={() => setView("collapsed")}
        >
          <div className="flex items-center gap-1.5">
            <Braces className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Variables</span>
            <span className="text-[10px] text-muted-foreground">({allVariables.length})</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="px-3 pb-2 space-y-0.5 max-h-40 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted-foreground py-2">Loading…</p>
          ) : (
            allVariables.map((v) => (
              <button
                key={v.id}
                className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-accent text-xs group"
                onClick={() => copyToken(v.token)}
                title={`Click to copy ${v.token}`}
              >
                <code className="text-primary font-mono text-[10px] truncate flex-1">{v.token}</code>
                <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
              </button>
            ))
          )}
        </div>
        <div className="px-3 pb-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-[11px]"
            onClick={() => setView("manage")}
          >
            <Braces className="w-3 h-3 mr-1" />Manage Variables
          </Button>
        </div>
      </div>
    );
  }

  // Manage view — inline CRUD
  return (
    <div className="border-b border-border flex flex-col max-h-[60vh]">
      {/* Header with back */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setView("list"); resetForm(); }}>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-foreground">Manage Variables</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setView("collapsed"); resetForm(); }}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Variable list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {loading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Loading…</p>
        ) : (
          allRows.map((row) => (
            <div key={row.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-accent group text-xs">
              {row.isSystem ? <Globe className="w-3 h-3 text-muted-foreground shrink-0" /> : <Braces className="w-3 h-3 text-primary shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground truncate block">{row.name}</span>
                <code className="text-[10px] text-muted-foreground font-mono">{row.token}</code>
              </div>
              {row.isSystem ? (
                <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />System
                </Badge>
              ) : (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToken(row.token)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => startEdit(row as any)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => setDeleteId(row.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit form */}
      {showAddForm ? (
        <div className="px-3 py-3 border-t border-border space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{editingId ? "Edit Variable" : "New Variable"}</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={resetForm}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Name</Label>
            <Input className="h-7 text-xs" placeholder="e.g. Job Title" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Token</Label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground font-mono text-[10px]">{"{{"}</span>
              <Input className="h-7 text-xs font-mono" placeholder="job_title" value={formToken} onChange={(e) => setFormToken(e.target.value.replace(/[^a-z0-9_]/gi, "_").toLowerCase())} />
              <span className="text-muted-foreground font-mono text-[10px]">{"}}"}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Fallback</Label>
            <Input className="h-7 text-xs" placeholder="Default value" value={formFallback} onChange={(e) => setFormFallback(e.target.value)} />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={resetForm}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSave}>{editingId ? "Save" : "Add"}</Button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-border shrink-0">
          <Button variant="outline" size="sm" className="w-full h-7 text-[11px]" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3 h-3 mr-1" />Add Variable
          </Button>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variable?</AlertDialogTitle>
            <AlertDialogDescription>Pages using this token will show the raw token text.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuilderVariablesPanel;
