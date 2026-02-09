-- Add logo_url to landing_page_templates
ALTER TABLE public.landing_page_templates
ADD COLUMN logo_url text DEFAULT NULL;

-- Create storage bucket for template logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-logos', 'template-logos', true);

-- Anyone can view logos (public bucket)
CREATE POLICY "Template logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-logos');

-- Authenticated users can upload logos
CREATE POLICY "Authenticated users can upload template logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'template-logos' AND auth.uid() IS NOT NULL);

-- Authenticated users can update their logos
CREATE POLICY "Authenticated users can update template logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'template-logos' AND auth.uid() IS NOT NULL);

-- Authenticated users can delete logos
CREATE POLICY "Authenticated users can delete template logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'template-logos' AND auth.uid() IS NOT NULL);