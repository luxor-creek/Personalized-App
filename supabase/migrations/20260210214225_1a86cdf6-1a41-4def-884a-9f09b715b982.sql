
-- Create storage bucket for template images
INSERT INTO storage.buckets (id, name, public) VALUES ('template-images', 'template-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Template images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload template images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'template-images' AND auth.role() = 'authenticated');

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update template images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'template-images' AND auth.role() = 'authenticated');

-- Authenticated users can delete their uploads
CREATE POLICY "Authenticated users can delete template images"
ON storage.objects FOR DELETE
USING (bucket_id = 'template-images' AND auth.role() = 'authenticated');
