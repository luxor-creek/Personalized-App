-- Add engagement tracking columns to page_views
ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS time_on_page_seconds integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_scroll_depth integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_return_visit boolean DEFAULT false;

-- Allow updating page_views so we can update time_on_page and scroll_depth on page unload
CREATE POLICY "Anyone can update own page view metrics"
ON public.page_views
FOR UPDATE
USING (true)
WITH CHECK (true);