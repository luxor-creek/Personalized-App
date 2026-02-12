import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import SectionRenderer from "@/components/builder/SectionRenderer";
import { BuilderSection } from "@/types/builder";

const BuilderPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract personalization from query params (p_first_name, p_last_name, etc.)
  const personalization: Record<string, string> | undefined = (() => {
    const p: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("p_") && value) {
        p[key.slice(2)] = value;
      }
    }
    if (p.first_name || p.last_name || p.company) {
      if (p.first_name && p.last_name) {
        p.full_name = `${p.first_name} ${p.last_name}`.trim();
      }
      return p;
    }
    return undefined;
  })();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("landing_page_templates")
          .select("sections, accent_color")
          .eq("slug", slug)
          .single();
        if (fetchError) throw fetchError;
        setSections(Array.isArray(data.sections) ? (data.sections as unknown as BuilderSection[]) : []);
        setAccentColor(data.accent_color);
      } catch (err: any) {
        setError(err.message || "Template not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{error || "No sections found"}</p>
      </div>
    );
  }

  return (
    <TemplateAccentProvider accentColor={accentColor} className="min-h-screen bg-white">
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} isPreview personalization={personalization} />
      ))}
    </TemplateAccentProvider>
  );
};

export default BuilderPreview;
