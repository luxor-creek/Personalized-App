
-- Add is_paused column to personalized_pages (may already exist from partial run)
ALTER TABLE public.personalized_pages ADD COLUMN IF NOT EXISTS is_paused boolean NOT NULL DEFAULT false;

-- Drop and recreate the function with new return type
DROP FUNCTION IF EXISTS public.get_personalized_page_by_token(text);

CREATE FUNCTION public.get_personalized_page_by_token(lookup_token text)
 RETURNS TABLE(id uuid, campaign_id uuid, token text, first_name text, last_name text, company text, custom_message text, template_id uuid, created_at timestamp with time zone, is_paused boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    pp.id,
    pp.campaign_id,
    pp.token,
    pp.first_name,
    pp.last_name,
    pp.company,
    pp.custom_message,
    c.template_id,
    pp.created_at,
    pp.is_paused
  FROM public.personalized_pages pp
  JOIN public.campaigns c ON c.id = pp.campaign_id
  WHERE pp.token = lookup_token
  LIMIT 1;
$$;
