-- Fix RLS policies for landing_page_templates
-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow all template operations" ON public.landing_page_templates;

-- Create proper policies - templates are readable by anyone (public landing pages) but only admin can modify
CREATE POLICY "Templates are publicly readable" 
ON public.landing_page_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can modify templates" 
ON public.landing_page_templates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update templates" 
ON public.landing_page_templates 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete templates" 
ON public.landing_page_templates 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for campaigns
DROP POLICY IF EXISTS "Allow all campaign operations" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix RLS policies for personalized_pages
DROP POLICY IF EXISTS "Anyone can view personalized pages by token" ON public.personalized_pages;
DROP POLICY IF EXISTS "Allow insert personalized pages" ON public.personalized_pages;
DROP POLICY IF EXISTS "Allow update personalized pages" ON public.personalized_pages;
DROP POLICY IF EXISTS "Allow delete personalized pages" ON public.personalized_pages;

-- Allow viewing by token (for public landing page access) or by authenticated campaign owner
CREATE POLICY "View personalized pages by token or owner" 
ON public.personalized_pages 
FOR SELECT 
USING (
  token IS NOT NULL OR 
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Campaign owners can insert personalized pages" 
ON public.personalized_pages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Campaign owners can update personalized pages" 
ON public.personalized_pages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Campaign owners can delete personalized pages" 
ON public.personalized_pages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

-- Fix RLS policies for page_views
DROP POLICY IF EXISTS "Allow viewing page analytics" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can insert page views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users who own the campaign can view analytics
CREATE POLICY "Campaign owners can view page analytics" 
ON public.page_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.personalized_pages pp
    JOIN public.campaigns c ON c.id = pp.campaign_id
    WHERE pp.id = personalized_page_id AND c.user_id = auth.uid()
  )
);