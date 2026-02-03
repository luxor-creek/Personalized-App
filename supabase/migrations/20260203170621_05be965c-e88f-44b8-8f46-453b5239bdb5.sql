-- Fix the personalized_pages SELECT policy
-- The token check needs to match against a request parameter, not just check if column is not null
DROP POLICY IF EXISTS "View personalized pages by token or owner" ON public.personalized_pages;

-- Create a proper policy that requires either:
-- 1. The user is authenticated and owns the campaign
-- 2. OR it's a public read (for the landing page - we'll handle token validation in app code)
-- Since we can't access request params in RLS, we make it readable but the app validates tokens
CREATE POLICY "Authenticated campaign owners can view all pages" 
ON public.personalized_pages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

-- For public token-based access, we need a separate approach
-- The landing page needs to query by token, so we allow that specific access pattern
CREATE POLICY "Public can view by specific token" 
ON public.personalized_pages 
FOR SELECT 
USING (auth.uid() IS NULL); -- This allows anon access, token validation happens in app

-- Actually, let's use a better approach - create a security definer function for token lookup
DROP POLICY IF EXISTS "Public can view by specific token" ON public.personalized_pages;