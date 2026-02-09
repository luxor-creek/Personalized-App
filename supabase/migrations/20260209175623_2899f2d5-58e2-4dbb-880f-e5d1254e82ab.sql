-- Drop the old restrictive INSERT policy that requires ip_address NOT NULL
DROP POLICY IF EXISTS "Validated page views insert" ON public.page_views;

-- Create new INSERT policy that only requires a valid personalized_page_id
CREATE POLICY "Anyone can insert page views for valid pages"
ON public.page_views
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.personalized_pages pp WHERE pp.id = page_views.personalized_page_id
  )
);