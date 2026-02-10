
-- Create form_submissions table to store all form submissions per template
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.landing_page_templates(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  company TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  primary_goal TEXT,
  product_url TEXT,
  extra_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public forms on live pages)
CREATE POLICY "Anyone can insert form submissions"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

-- Template owners can view submissions for their templates
CREATE POLICY "Template owners can view form submissions"
ON public.form_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.landing_page_templates t
    WHERE t.id = form_submissions.template_id
    AND (t.user_id = auth.uid() OR (t.user_id IS NULL AND public.has_role(auth.uid(), 'admin'::app_role)))
  )
);

-- Template owners can delete submissions
CREATE POLICY "Template owners can delete form submissions"
ON public.form_submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.landing_page_templates t
    WHERE t.id = form_submissions.template_id
    AND (t.user_id = auth.uid() OR (t.user_id IS NULL AND public.has_role(auth.uid(), 'admin'::app_role)))
  )
);
