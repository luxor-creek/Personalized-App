-- Create a security definer function to safely look up personalized pages by token
-- This bypasses RLS but only returns the specific record matching the token
CREATE OR REPLACE FUNCTION public.get_personalized_page_by_token(lookup_token text)
RETURNS TABLE (
  id uuid,
  campaign_id uuid,
  token text,
  first_name text,
  last_name text,
  company text,
  custom_message text,
  template_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pp.id,
    pp.campaign_id,
    pp.token,
    pp.first_name,
    pp.last_name,
    pp.company,
    pp.custom_message,
    pp.template_id,
    pp.created_at
  FROM public.personalized_pages pp
  WHERE pp.token = lookup_token
  LIMIT 1;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_personalized_page_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_personalized_page_by_token(text) TO authenticated;