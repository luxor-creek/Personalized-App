CREATE OR REPLACE FUNCTION public.get_personalized_page_by_token(lookup_token text)
 RETURNS TABLE(
  id uuid,
  campaign_id uuid,
  token text,
  first_name text,
  last_name text,
  company text,
  custom_message text,
  template_id uuid,
  created_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    pp.id,
    pp.campaign_id,
    pp.token,
    pp.first_name,
    pp.last_name,
    pp.company,
    pp.custom_message,
    -- Always take the campaign's template as the source of truth for rendering
    c.template_id,
    pp.created_at
  FROM public.personalized_pages pp
  JOIN public.campaigns c ON c.id = pp.campaign_id
  WHERE pp.token = lookup_token
  LIMIT 1;
$function$;