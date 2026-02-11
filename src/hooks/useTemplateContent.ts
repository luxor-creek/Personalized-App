import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TemplateContent {
  id: string;
  slug: string;
  name: string;
  thumbnail_url?: string | null;
  hero_badge: string | null;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
  hero_video_id: string | null;
  hero_video_thumbnail_url: string | null;
  features_title: string | null;
  features_subtitle: string | null;
  features_list?: { title: string; description?: string }[] | null;
  feature_cards?: { title: string; subtitle?: string; description?: string }[] | null;
  about_content: string | null;
  testimonials_title: string | null;
  testimonials_subtitle: string | null;
  testimonials?: { quote: string; author?: string }[] | null;
  pricing_title: string | null;
  pricing_subtitle: string | null;
  pricing_tiers?: {
    name: string;
    description?: string;
    price?: string;
    features?: string[];
    cta?: string;
    featured?: boolean;
  }[] | null;
  contact_title: string | null;
  contact_subtitle: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  portfolio_strip_url: string | null;
  portfolio_videos: { title: string; videoId?: string; image?: string }[] | null;
  client_logos_url: string | null;

  comparison_problem_title?: string | null;
  comparison_problem_items?: string[] | null;
  comparison_solution_title?: string | null;
  comparison_solution_description?: string | null;
  comparison_solution_items?: string[] | null;
  custom_section_image_url?: string | null;
  cta_banner_title?: string | null;
  cta_banner_subtitle?: string | null;
  form_section_title?: string | null;
  form_section_subtitle?: string | null;
  logo_url?: string | null;
  is_builder_template?: boolean;
  sections?: any[] | null;
  accent_color?: string | null;
  personalization_config?: Record<string, boolean> | null;
}

interface PersonalizationData {
  first_name?: string;
  last_name?: string;
  company?: string;
  full_name?: string;
  landing_page?: string;
  custom_field?: string;
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
  result = result.replace(/\{\{company_name\}\}/gi, data.company || "");
  result = result.replace(/\{\{full_name\}\}/gi, data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim());
  result = result.replace(/\{\{landing_page\}\}/gi, data.landing_page || "");
  result = result.replace(/\{\{custom_field\}\}/gi, data.custom_field || "");
  
  // Clean up any remaining tokens (but preserve whitespace/newlines)
  result = result.replace(/\{\{[^}]+\}\}/g, "").trim();
  
  return result;
}

export function useTemplateContent(slug: string) {
  const [template, setTemplate] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      // Reset state for fresh fetch
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from("landing_page_templates")
          .select(`
            id,
            slug,
            name,
            thumbnail_url,
            hero_badge,
            hero_headline,
            hero_subheadline,
            hero_cta_primary_text,
            hero_cta_secondary_text,
            hero_video_id,
            hero_video_thumbnail_url,
            features_title,
            features_subtitle,
            features_list,
            feature_cards,
            about_content,
            testimonials_title,
            testimonials_subtitle,
            testimonials,
            pricing_title,
            pricing_subtitle,
            pricing_tiers,
            contact_title,
            contact_subtitle,
            contact_email,
            contact_phone,
            portfolio_strip_url,
            portfolio_videos,
            client_logos_url,
            comparison_problem_title,
            comparison_problem_items,
            comparison_solution_title,
            comparison_solution_description,
            comparison_solution_items,
            custom_section_image_url,
            cta_banner_title,
            cta_banner_subtitle,
            form_section_title,
            form_section_subtitle,
            logo_url,
            is_builder_template,
            sections,
            accent_color,
            personalization_config
          `)
          .eq("slug", slug)
          .single();

        if (fetchError) {
          console.error("Error fetching template:", fetchError);
          setError(fetchError.message);
        } else {
          // Cast portfolio_videos from Json to the expected type
          const templateData: TemplateContent = {
            ...data,
            portfolio_videos: Array.isArray(data.portfolio_videos) 
              ? data.portfolio_videos as { title: string; videoId?: string; image?: string }[]
              : null,
            features_list: Array.isArray((data as any).features_list)
              ? ((data as any).features_list as { title: string; description?: string }[])
              : null,
            feature_cards: Array.isArray((data as any).feature_cards)
              ? ((data as any).feature_cards as { title: string; subtitle?: string; description?: string }[])
              : null,
            testimonials: Array.isArray((data as any).testimonials)
              ? ((data as any).testimonials as { quote: string; author?: string }[])
              : null,
            pricing_tiers: Array.isArray((data as any).pricing_tiers)
              ? ((data as any).pricing_tiers as TemplateContent["pricing_tiers"])
              : null,
            comparison_problem_items: Array.isArray((data as any).comparison_problem_items)
              ? ((data as any).comparison_problem_items as string[])
              : null,
            comparison_solution_items: Array.isArray((data as any).comparison_solution_items)
              ? ((data as any).comparison_solution_items as string[])
              : null,
            sections: Array.isArray((data as any).sections) ? (data as any).sections : null,
            personalization_config: typeof data.personalization_config === 'object' && data.personalization_config !== null && !Array.isArray(data.personalization_config)
              ? data.personalization_config as Record<string, boolean>
              : null,
          };
          setTemplate(templateData);
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

export function useTemplateContentById(templateId: string | null) {
  const [template, setTemplate] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("landing_page_templates")
          .select(`
            id,
            slug,
            name,
            thumbnail_url,
            hero_badge,
            hero_headline,
            hero_subheadline,
            hero_cta_primary_text,
            hero_cta_secondary_text,
            hero_video_id,
            hero_video_thumbnail_url,
            features_title,
            features_subtitle,
            features_list,
            feature_cards,
            about_content,
            testimonials_title,
            testimonials_subtitle,
            testimonials,
            pricing_title,
            pricing_subtitle,
            pricing_tiers,
            contact_title,
            contact_subtitle,
            contact_email,
            contact_phone,
            portfolio_strip_url,
            portfolio_videos,
            client_logos_url,
            comparison_problem_title,
            comparison_problem_items,
            comparison_solution_title,
            comparison_solution_description,
            comparison_solution_items,
            custom_section_image_url,
            cta_banner_title,
            cta_banner_subtitle,
            form_section_title,
            form_section_subtitle,
            logo_url,
            is_builder_template,
            sections,
            accent_color,
            personalization_config
          `)
          .eq("id", templateId)
          .single();

        if (fetchError) {
          console.error("Error fetching template by ID:", fetchError);
          setError(fetchError.message);
        } else {
          const templateData: TemplateContent = {
            ...data,
            portfolio_videos: Array.isArray(data.portfolio_videos) 
              ? data.portfolio_videos as { title: string; videoId?: string; image?: string }[]
              : null,
            features_list: Array.isArray((data as any).features_list)
              ? ((data as any).features_list as { title: string; description?: string }[])
              : null,
            feature_cards: Array.isArray((data as any).feature_cards)
              ? ((data as any).feature_cards as { title: string; subtitle?: string; description?: string }[])
              : null,
            testimonials: Array.isArray((data as any).testimonials)
              ? ((data as any).testimonials as { quote: string; author?: string }[])
              : null,
            pricing_tiers: Array.isArray((data as any).pricing_tiers)
              ? ((data as any).pricing_tiers as TemplateContent["pricing_tiers"])
              : null,
            comparison_problem_items: Array.isArray((data as any).comparison_problem_items)
              ? ((data as any).comparison_problem_items as string[])
              : null,
            comparison_solution_items: Array.isArray((data as any).comparison_solution_items)
              ? ((data as any).comparison_solution_items as string[])
              : null,
            sections: Array.isArray((data as any).sections) ? (data as any).sections : null,
            personalization_config: typeof data.personalization_config === 'object' && data.personalization_config !== null && !Array.isArray(data.personalization_config)
              ? data.personalization_config as Record<string, boolean>
              : null,
          };
          setTemplate(templateData);
        }
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  return { template, loading, error };
}
