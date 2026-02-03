-- Create landing page templates table
CREATE TABLE public.landing_page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Hero section
  hero_badge TEXT,
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT,
  hero_cta_primary_text TEXT,
  hero_cta_secondary_text TEXT,
  hero_video_id TEXT,
  hero_video_thumbnail_url TEXT,
  
  -- Features section
  features_title TEXT,
  features_subtitle TEXT,
  features_list JSONB DEFAULT '[]'::jsonb,
  feature_cards JSONB DEFAULT '[]'::jsonb,
  
  -- Testimonials section
  testimonials_title TEXT,
  testimonials_subtitle TEXT,
  testimonials JSONB DEFAULT '[]'::jsonb,
  
  -- Pricing section
  pricing_title TEXT,
  pricing_subtitle TEXT,
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  
  -- Contact section
  contact_title TEXT,
  contact_subtitle TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Personalization settings (which fields support personalization)
  personalization_config JSONB DEFAULT '{"headline": false, "subheadline": false, "badge": false}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations (password-protected admin)
CREATE POLICY "Allow all template operations"
ON public.landing_page_templates
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_landing_page_templates_updated_at
BEFORE UPDATE ON public.landing_page_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Seed with existing templates
INSERT INTO public.landing_page_templates (
  slug, 
  name, 
  hero_badge,
  hero_headline, 
  hero_subheadline,
  hero_cta_primary_text,
  hero_cta_secondary_text,
  hero_video_id,
  features_title,
  features_subtitle,
  personalization_config
) VALUES 
(
  'police-recruitment',
  'Police Recruitment Demo',
  'Police Recruitment Video Demo',
  'A recruitment video that actually helps your {{hiring_pipeline}}.',
  'Watch how we create recruitment videos that help the right people self-select into the job.',
  'Get in Touch',
  'Learn More',
  '1153753885',
  'About Our Process',
  'We create compelling recruitment videos that attract qualified candidates.',
  '{"headline": true, "subheadline": true, "badge": true}'::jsonb
),
(
  'b2b-demo',
  'B2B Product Demo',
  'Kicker Video — B2B Video Production',
  'Your Product Demo, Sharpened for Decision-Makers',
  'Built for marketing and product leaders who need a clear, on-brand story. AI video is here — but it''s not ready to produce your B2B demos on its own.',
  'Book a 15-min strategy call',
  'Get pricing',
  '76979871',
  'Clarity, speed, and on-brand delivery',
  'We blend senior creative teams with AI-assisted tooling to cut timelines and keep costs predictable.',
  '{"headline": true, "subheadline": true, "badge": false}'::jsonb
);

-- Add template reference to personalized_pages
ALTER TABLE public.personalized_pages 
ADD COLUMN template_id UUID REFERENCES public.landing_page_templates(id);