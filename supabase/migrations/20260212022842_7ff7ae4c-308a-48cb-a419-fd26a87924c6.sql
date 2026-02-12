
-- Add photo_url column to personalized_pages
ALTER TABLE public.personalized_pages ADD COLUMN IF NOT EXISTS photo_url text;

-- Create link_clicks table for tracking CTA/link clicks on landing pages
CREATE TABLE public.link_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personalized_page_id uuid NOT NULL REFERENCES public.personalized_pages(id) ON DELETE CASCADE,
  link_label text,
  link_url text,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text
);

-- Enable RLS
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Insert policy: anyone can insert for valid pages (like page_views)
CREATE POLICY "Link clicks for valid pages only"
ON public.link_clicks
FOR INSERT
WITH CHECK (
  personalized_page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM personalized_pages pp WHERE pp.id = link_clicks.personalized_page_id)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (link_label IS NULL OR length(link_label) <= 200)
  AND (link_url IS NULL OR length(link_url) <= 2000)
);

-- Campaign owners can view link clicks
CREATE POLICY "Campaign owners can view link clicks"
ON public.link_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM personalized_pages pp
    JOIN campaigns c ON c.id = pp.campaign_id
    WHERE pp.id = link_clicks.personalized_page_id AND c.user_id = auth.uid()
  )
);

-- Admins can view all link clicks
CREATE POLICY "Admins can view all link clicks"
ON public.link_clicks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
