import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TemplateAccentProvider from "@/components/TemplateAccentProvider";
import SectionRenderer from "@/components/builder/SectionRenderer";
import { BuilderSection } from "@/types/builder";

const BuilderPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <SectionRenderer key={section.id} section={section} isPreview />
      ))}
    </TemplateAccentProvider>
  );
};

export default BuilderPreview;
