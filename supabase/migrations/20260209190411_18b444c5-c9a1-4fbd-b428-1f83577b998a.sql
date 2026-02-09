
-- Add user_id to landing_page_templates (NULL = library/shared template)
ALTER TABLE public.landing_page_templates
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

-- Add an index for fast lookups by user
CREATE INDEX idx_landing_page_templates_user_id ON public.landing_page_templates(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Templates are publicly readable" ON public.landing_page_templates;
DROP POLICY IF EXISTS "Only authenticated users can modify templates" ON public.landing_page_templates;
DROP POLICY IF EXISTS "Only authenticated users can update templates" ON public.landing_page_templates;
DROP POLICY IF EXISTS "Only authenticated users can delete templates" ON public.landing_page_templates;

-- New RLS policies:
-- Everyone can read library templates (user_id IS NULL) + users can read their own
CREATE POLICY "Users can view library and own templates"
ON public.landing_page_templates FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());

-- Only admins can insert library templates (user_id IS NULL)
-- Any authenticated user can insert their own templates
CREATE POLICY "Users can create own templates"
ON public.landing_page_templates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR (user_id IS NULL AND has_role(auth.uid(), 'admin'))));

-- Users can only update their own templates; admins can update library templates
CREATE POLICY "Users can update own templates"
ON public.landing_page_templates FOR UPDATE
USING (
  (user_id = auth.uid()) OR
  (user_id IS NULL AND has_role(auth.uid(), 'admin'))
);

-- Users can only delete their own templates; admins can delete library templates
CREATE POLICY "Users can delete own templates"
ON public.landing_page_templates FOR DELETE
USING (
  (user_id = auth.uid()) OR
  (user_id IS NULL AND has_role(auth.uid(), 'admin'))
);
