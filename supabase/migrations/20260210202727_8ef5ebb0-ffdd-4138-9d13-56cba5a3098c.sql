-- Add SELECT policy for personalized_pages restricting to campaign owners
CREATE POLICY "Campaign owners can view personalized pages"
ON public.personalized_pages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.campaigns c 
    WHERE c.id = personalized_pages.campaign_id 
      AND c.user_id = auth.uid()
  )
);

-- Also allow anon to select (needed for public page viewing via RPC, but RPC uses SECURITY DEFINER so this is safe)
-- The get_personalized_page_by_token function already handles anon access via SECURITY DEFINER