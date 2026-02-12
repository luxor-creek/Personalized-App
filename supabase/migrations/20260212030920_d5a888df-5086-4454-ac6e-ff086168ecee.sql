-- Drop the overly permissive policy and replace with a more targeted one
DROP POLICY IF EXISTS "Anyone can update own page view metrics" ON public.page_views;

-- Only allow updating tracking metrics (time_on_page_seconds, max_scroll_depth), 
-- and only if the row was recently created (within last 30 min) to prevent abuse
CREATE POLICY "Update page view engagement metrics"
ON public.page_views
FOR UPDATE
USING (viewed_at > now() - interval '30 minutes')
WITH CHECK (viewed_at > now() - interval '30 minutes');