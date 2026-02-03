import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TemplateContent {
  id: string;
  slug: string;
  name: string;
  hero_badge: string | null;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
  hero_video_id: string | null;
  hero_video_thumbnail_url: string | null;
  features_title: string | null;
  features_subtitle: string | null;
  contact_title: string | null;
  contact_subtitle: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface PersonalizationData {
  first_name?: string;
  last_name?: string;
  company?: string;
  full_name?: string;
}

// Apply personalization tokens to a string
export function applyPersonalization(
  text: string | null | undefined,
  data: PersonalizationData
): string {
  if (!text) return "";
  
  let result = text;
  
  // Replace tokens
  result = result.replace(/\{\{first_name\}\}/gi, data.first_name || "");
  result = result.replace(/\{\{last_name\}\}/gi, data.last_name || "");
  result = result.replace(/\{\{company\}\}/gi, data.company || "");
  result = result.replace(/\{\{full_name\}\}/gi, data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim());
  
  // Clean up any remaining tokens or extra spaces
  result = result.replace(/\{\{[^}]+\}\}/g, "").replace(/\s+/g, " ").trim();
  
  return result;
}

export function useTemplateContent(slug: string) {
  const [template, setTemplate] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("landing_page_templates")
          .select(`
            id,
            slug,
            name,
            hero_badge,
            hero_headline,
            hero_subheadline,
            hero_cta_primary_text,
            hero_cta_secondary_text,
            hero_video_id,
            hero_video_thumbnail_url,
            features_title,
            features_subtitle,
            contact_title,
            contact_subtitle,
            contact_email,
            contact_phone
          `)
          .eq("slug", slug)
          .single();

        if (fetchError) {
          console.error("Error fetching template:", fetchError);
          setError(fetchError.message);
        } else {
          setTemplate(data);
        }
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [slug]);

  return { template, loading, error };
}
