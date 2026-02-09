import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BuilderSection, SECTION_DEFAULTS, SectionType } from "@/types/builder";
import SectionPalette from "@/components/builder/SectionPalette";
import SectionProperties from "@/components/builder/SectionProperties";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye, Pencil } from "lucide-react";

const BuilderPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { toast } = useToast();

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Page");
  const [templateSlug, setTemplateSlug] = useState("");
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!slug);
  const [editingName, setEditingName] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    });
  }, [navigate]);

  // Load existing template if editing
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("landing_page_templates")
          .select("id, name, slug, sections")
          .eq("slug", slug)
          .single();
        if (error) throw error;
        setTemplateId(data.id);
        setTemplateName(data.name);
        setTemplateSlug(data.slug);
        setSections(Array.isArray(data.sections) ? (data.sections as unknown as BuilderSection[]) : []);
      } catch (err: any) {
        toast({ title: "Error loading template", description: err.message, variant: "destructive" });
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate, toast]);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const addSection = useCallback((type: SectionType) => {
    const defaults = SECTION_DEFAULTS[type];
    const newSection: BuilderSection = {
      id: generateId(),
      type,
      content: { ...defaults.content },
      style: { ...defaults.style },
    };
    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newSection.id);
  }, []);

  const updateSection = useCallback((updated: BuilderSection) => {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }, []);

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [selectedSectionId]);

  const duplicateSection = useCallback((id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const clone: BuilderSection = {
        ...JSON.parse(JSON.stringify(prev[idx])),
        id: generateId(),
      };
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
  }, []);

  const saveTemplate = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      if (templateId) {
        // Update existing
        const { error } = await supabase
          .from("landing_page_templates")
          .update({
            name: templateName,
            sections: sections as any,
            is_builder_template: true,
          } as any)
          .eq("id", templateId);
        if (error) throw error;
      } else {
        // Create new
        const newSlug = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
        const { data, error } = await supabase
          .from("landing_page_templates")
          .insert({
            name: templateName,
            slug: newSlug,
            hero_headline: templateName,
            sections: sections as any,
            is_builder_template: true,
            user_id: userId,
          } as any)
          .select("id, slug")
          .single();
        if (error) throw error;
        setTemplateId(data.id);
        setTemplateSlug(data.slug);
        // Update URL without reload
        window.history.replaceState(null, '', `/builder/${data.slug}`);
      }
      toast({ title: "Saved!" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          {editingName ? (
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="h-8 w-64 text-sm"
              autoFocus
            />
          ) : (
            <button
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setEditingName(true)}
            >
              {templateName}
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">{sections.length} sections</span>
          <Button variant="outline" size="sm" onClick={saveTemplate} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section Palette */}
        <SectionPalette onAddSection={addSection} />

        {/* Center: Canvas */}
        <BuilderCanvas
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onMoveSection={moveSection}
          onDeleteSection={deleteSection}
          onDuplicateSection={duplicateSection}
        />

        {/* Right: Properties Panel */}
        {selectedSection && (
          <SectionProperties
            section={selectedSection}
            onUpdate={updateSection}
            onClose={() => setSelectedSectionId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
