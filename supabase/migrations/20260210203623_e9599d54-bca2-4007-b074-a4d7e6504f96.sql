-- Create a SECURITY DEFINER function to fetch template data for public page rendering
-- This bypasses RLS so anonymous visitors can see user-owned templates on personalized pages
CREATE OR REPLACE FUNCTION public.get_template_for_public_page(template_uuid uuid)
RETURNS TABLE(
  id uuid,
  slug text,
  name text,
  thumbnail_url text,
  hero_badge text,
  hero_headline text,
  hero_subheadline text,
  hero_cta_primary_text text,
  hero_cta_secondary_text text,
  hero_video_id text,
  hero_video_thumbnail_url text,
  features_title text,
  features_subtitle text,
  features_list jsonb,
  feature_cards jsonb,
  about_content text,
  testimonials_title text,
  testimonials_subtitle text,
  testimonials jsonb,
  pricing_title text,
  pricing_subtitle text,
  pricing_tiers jsonb,
  contact_title text,
  contact_subtitle text,
  contact_email text,
  contact_phone text,
  portfolio_strip_url text,
  portfolio_videos jsonb,
  client_logos_url text,
  comparison_problem_title text,
  comparison_problem_items jsonb,
  comparison_solution_title text,
  comparison_solution_description text,
  comparison_solution_items jsonb,
  custom_section_image_url text,
  cta_banner_title text,
  cta_banner_subtitle text,
  form_section_title text,
  form_section_subtitle text,
  logo_url text,
  is_builder_template boolean,
  sections jsonb,
  accent_color text,
  personalization_config jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id, t.slug, t.name, t.thumbnail_url,
    t.hero_badge, t.hero_headline, t.hero_subheadline,
    t.hero_cta_primary_text, t.hero_cta_secondary_text,
    t.hero_video_id, t.hero_video_thumbnail_url,
    t.features_title, t.features_subtitle, t.features_list, t.feature_cards,
    t.about_content,
    t.testimonials_title, t.testimonials_subtitle, t.testimonials,
    t.pricing_title, t.pricing_subtitle, t.pricing_tiers,
    t.contact_title, t.contact_subtitle, t.contact_email, t.contact_phone,
    t.portfolio_strip_url, t.portfolio_videos, t.client_logos_url,
    t.comparison_problem_title, t.comparison_problem_items,
    t.comparison_solution_title, t.comparison_solution_description, t.comparison_solution_items,
    t.custom_section_image_url,
    t.cta_banner_title, t.cta_banner_subtitle,
    t.form_section_title, t.form_section_subtitle,
    t.logo_url, t.is_builder_template, t.sections, t.accent_color, t.personalization_config
  FROM public.landing_page_templates t
  -- Only allow fetching templates that are actually used by a campaign with pages
  WHERE t.id = template_uuid
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.template_id = template_uuid
    )
  LIMIT 1;
$$;