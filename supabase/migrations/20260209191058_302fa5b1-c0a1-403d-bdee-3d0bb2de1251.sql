
-- Add sections JSONB column for the page builder
ALTER TABLE public.landing_page_templates
ADD COLUMN sections jsonb DEFAULT NULL;

-- Add a flag to indicate this template uses the builder (vs legacy fields)
ALTER TABLE public.landing_page_templates
ADD COLUMN is_builder_template boolean DEFAULT false;
