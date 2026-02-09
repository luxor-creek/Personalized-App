import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TemplateData {
  id: string;
  slug: string;
  name: string;
  thumbnail_url: string | null;
  hero_badge: string | null;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
  hero_video_id: string | null;
  hero_video_thumbnail_url: string | null;
  features_title: string | null;
  features_subtitle: string | null;
  features_list: any[];
  feature_cards: any[];
  testimonials_title: string | null;
  testimonials_subtitle: string | null;
  testimonials: any[];
  pricing_title: string | null;
  pricing_subtitle: string | null;
  pricing_tiers: any[];
  contact_title: string | null;
  contact_subtitle: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  personalization_config: Record<string, boolean>;
  about_content: string | null;
  client_logos_url: string | null;
  portfolio_strip_url: string | null;
  // Comparison section
  comparison_problem_title: string | null;
  comparison_problem_items: string[];
  comparison_solution_title: string | null;
  comparison_solution_description: string | null;
  comparison_solution_items: string[];
  // Portfolio videos and custom section
  portfolio_videos: { title: string; videoId?: string; image?: string }[];
  custom_section_image_url: string | null;
  // CTA Banner section
  cta_banner_title: string | null;
  cta_banner_subtitle: string | null;
  // Form section
  form_section_title: string | null;
  form_section_subtitle: string | null;
  logo_url: string | null;
  user_id: string | null;
  accent_color: string | null;
}

export function useTemplateEditor(slug: string | undefined) {
  const { toast } = useToast();
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [originalTemplate, setOriginalTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch template
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!slug) {
        setError("No template specified");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("landing_page_templates")
          .select("*")
          .eq("slug", slug)
          .single();

        if (fetchError) throw fetchError;

        // Parse JSONB fields with proper type casting
        const templateData: TemplateData = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          thumbnail_url: data.thumbnail_url,
          hero_badge: data.hero_badge,
          hero_headline: data.hero_headline,
          hero_subheadline: data.hero_subheadline,
          hero_cta_primary_text: data.hero_cta_primary_text,
          hero_cta_secondary_text: data.hero_cta_secondary_text,
          hero_video_id: data.hero_video_id,
          hero_video_thumbnail_url: data.hero_video_thumbnail_url,
          features_title: data.features_title,
          features_subtitle: data.features_subtitle,
          features_list: Array.isArray(data.features_list) ? data.features_list : [],
          feature_cards: Array.isArray(data.feature_cards) ? data.feature_cards : [],
          testimonials_title: data.testimonials_title,
          testimonials_subtitle: data.testimonials_subtitle,
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          pricing_title: data.pricing_title,
          pricing_subtitle: data.pricing_subtitle,
          pricing_tiers: Array.isArray(data.pricing_tiers) ? data.pricing_tiers : [],
          contact_title: data.contact_title,
          contact_subtitle: data.contact_subtitle,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          personalization_config: typeof data.personalization_config === 'object' && data.personalization_config !== null && !Array.isArray(data.personalization_config) 
            ? data.personalization_config as Record<string, boolean>
            : {},
          about_content: (data as any).about_content ?? null,
          client_logos_url: (data as any).client_logos_url ?? null,
          portfolio_strip_url: (data as any).portfolio_strip_url ?? null,
          // Comparison section
          comparison_problem_title: (data as any).comparison_problem_title ?? null,
          comparison_problem_items: Array.isArray((data as any).comparison_problem_items) ? (data as any).comparison_problem_items : [],
          comparison_solution_title: (data as any).comparison_solution_title ?? null,
          comparison_solution_description: (data as any).comparison_solution_description ?? null,
          comparison_solution_items: Array.isArray((data as any).comparison_solution_items) ? (data as any).comparison_solution_items : [],
          // Portfolio videos and custom section
          portfolio_videos: Array.isArray((data as any).portfolio_videos) ? (data as any).portfolio_videos : [],
          custom_section_image_url: (data as any).custom_section_image_url ?? null,
          // CTA Banner section
          cta_banner_title: (data as any).cta_banner_title ?? null,
          cta_banner_subtitle: (data as any).cta_banner_subtitle ?? null,
          // Form section
          form_section_title: (data as any).form_section_title ?? null,
          form_section_subtitle: (data as any).form_section_subtitle ?? null,
          logo_url: (data as any).logo_url ?? null,
          user_id: (data as any).user_id ?? null,
          accent_color: (data as any).accent_color ?? null,
        };

        setTemplate(templateData);
        setOriginalTemplate(templateData);
      } catch (err: any) {
        console.error("Error fetching template:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [slug]);

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    if (!template || !originalTemplate) return false;
    return JSON.stringify(template) !== JSON.stringify(originalTemplate);
  }, [template, originalTemplate]);

  // Update a field
  const updateField = useCallback(<K extends keyof TemplateData>(
    field: K,
    value: TemplateData[K]
  ) => {
    setTemplate((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!template) return false;

    setSaving(true);
    try {
      const { data: updateData, error: updateError } = await supabase
        .from("landing_page_templates")
        .update({
          name: template.name,
          thumbnail_url: template.thumbnail_url,
          hero_badge: template.hero_badge,
          hero_headline: template.hero_headline,
          hero_subheadline: template.hero_subheadline,
          hero_cta_primary_text: template.hero_cta_primary_text,
          hero_cta_secondary_text: template.hero_cta_secondary_text,
          hero_video_id: template.hero_video_id,
          hero_video_thumbnail_url: template.hero_video_thumbnail_url,
          features_title: template.features_title,
          features_subtitle: template.features_subtitle,
          features_list: template.features_list,
          feature_cards: template.feature_cards,
          testimonials_title: template.testimonials_title,
          testimonials_subtitle: template.testimonials_subtitle,
          testimonials: template.testimonials,
          pricing_title: template.pricing_title,
          pricing_subtitle: template.pricing_subtitle,
          pricing_tiers: template.pricing_tiers,
          contact_title: template.contact_title,
          contact_subtitle: template.contact_subtitle,
          contact_email: template.contact_email,
          contact_phone: template.contact_phone,
          personalization_config: template.personalization_config,
          about_content: template.about_content,
          client_logos_url: template.client_logos_url,
          portfolio_strip_url: template.portfolio_strip_url,
          comparison_problem_title: template.comparison_problem_title,
          comparison_problem_items: template.comparison_problem_items,
          comparison_solution_title: template.comparison_solution_title,
          comparison_solution_description: template.comparison_solution_description,
          comparison_solution_items: template.comparison_solution_items,
          portfolio_videos: template.portfolio_videos,
          custom_section_image_url: template.custom_section_image_url,
          cta_banner_title: template.cta_banner_title,
          cta_banner_subtitle: template.cta_banner_subtitle,
          form_section_title: template.form_section_title,
          form_section_subtitle: template.form_section_subtitle,
          logo_url: template.logo_url,
        } as any)
        .eq("id", template.id)
        .select();

      if (updateError) throw updateError;
      
      if (!updateData || updateData.length === 0) {
        throw new Error("Save failed — you may need to log in again. Please sign in and try again.");
      }

      setOriginalTemplate(template);
      toast({ title: "Changes saved successfully!" });
      return true;
    } catch (err: any) {
      console.error("Error saving template:", err);
      toast({
        title: "Error saving changes",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [template, toast]);

  // Discard changes
  const discardChanges = useCallback(() => {
    setTemplate(originalTemplate);
  }, [originalTemplate]);

  return {
    template,
    loading,
    saving,
    error,
    hasChanges: hasChanges(),
    updateField,
    saveChanges,
    discardChanges,
  };
}
