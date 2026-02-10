
-- =============================================================
-- PHASE 3: Security hardening + usage limit enforcement
-- =============================================================

-- 1. Create a secure view for profiles that hides Stripe fields from regular users
-- Admin queries will still use the base table via RLS
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT 
    id, user_id, email, full_name, plan, trial_ends_at,
    max_pages, max_live_pages, max_campaigns,
    created_at, updated_at
  FROM public.profiles;
-- Note: stripe_customer_id and stripe_subscription_id are excluded

-- 2. Server-side usage limit enforcement function
-- Returns TRUE if the user can create more of the resource type
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  _user_id UUID,
  _resource_type TEXT  -- 'page' or 'campaign'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan TEXT;
  _trial_ends_at TIMESTAMPTZ;
  _max_pages INT;
  _max_campaigns INT;
  _current_count INT;
BEGIN
  -- Get user's plan and limits
  SELECT plan, trial_ends_at, max_pages, max_campaigns
  INTO _plan, _trial_ends_at, _max_pages, _max_campaigns
  FROM public.profiles
  WHERE user_id = _user_id;

  -- No profile found = deny
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if trial expired
  IF _plan = 'trial' AND _trial_ends_at IS NOT NULL AND _trial_ends_at < now() THEN
    RETURN FALSE;
  END IF;

  -- Check resource limits
  IF _resource_type = 'campaign' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.campaigns
    WHERE user_id = _user_id;
    RETURN _current_count < _max_campaigns;
  ELSIF _resource_type = 'page' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.personalized_pages pp
    JOIN public.campaigns c ON c.id = pp.campaign_id
    WHERE c.user_id = _user_id;
    RETURN _current_count < _max_pages;
  END IF;

  RETURN FALSE;
END;
$$;

-- 3. Add RLS policy on campaigns INSERT to enforce limits
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
CREATE POLICY "Users can create their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.check_usage_limit(auth.uid(), 'campaign')
  );

-- 4. Add RLS policy on personalized_pages INSERT to enforce page limits
DROP POLICY IF EXISTS "Campaign owners can insert personalized pages" ON public.personalized_pages;
CREATE POLICY "Campaign owners can insert personalized pages"
  ON public.personalized_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = personalized_pages.campaign_id
      AND c.user_id = auth.uid()
    )
    AND public.check_usage_limit(auth.uid(), 'page')
  );

-- 5. Harden form_submissions INSERT — require non-empty template_id that exists
DROP POLICY IF EXISTS "Anyone can insert form submissions" ON public.form_submissions;
CREATE POLICY "Validated form submissions only"
  ON public.form_submissions FOR INSERT
  WITH CHECK (
    template_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.landing_page_templates t WHERE t.id = template_id
    )
    AND (email IS NULL OR length(email) <= 255)
    AND (first_name IS NULL OR length(first_name) <= 100)
    AND (last_name IS NULL OR length(last_name) <= 100)
    AND (phone IS NULL OR length(phone) <= 50)
    AND (company IS NULL OR length(company) <= 200)
  );

-- 6. Harden info_requests INSERT — basic field validation
DROP POLICY IF EXISTS "Anyone can submit info requests" ON public.info_requests;
CREATE POLICY "Validated info requests only"
  ON public.info_requests FOR INSERT
  WITH CHECK (
    length(first_name) > 0 AND length(first_name) <= 100
    AND length(email) > 0 AND length(email) <= 255
    AND email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 7. Harden page_views INSERT — ensure personalized_page_id exists and is valid UUID
DROP POLICY IF EXISTS "Anyone can insert page views for valid pages" ON public.page_views;
CREATE POLICY "Page views for valid pages only"
  ON public.page_views FOR INSERT
  WITH CHECK (
    personalized_page_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.personalized_pages pp WHERE pp.id = personalized_page_id
    )
    AND (ip_address IS NULL OR length(ip_address) <= 45)
    AND (user_agent IS NULL OR length(user_agent) <= 500)
  );
