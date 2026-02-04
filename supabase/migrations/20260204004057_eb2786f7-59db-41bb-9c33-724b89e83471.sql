-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- Create a new INSERT policy that validates the personalized_page_id exists
-- This prevents inserting fake analytics data for non-existent pages
CREATE POLICY "Validated page views insert" 
ON public.page_views 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.personalized_pages pp
    WHERE pp.id = personalized_page_id
  )
);