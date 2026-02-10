-- Change FK on personalized_pages.template_id to SET NULL on delete
ALTER TABLE public.personalized_pages
  DROP CONSTRAINT personalized_pages_template_id_fkey,
  ADD CONSTRAINT personalized_pages_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES public.landing_page_templates(id)
    ON DELETE SET NULL;

-- Also fix campaigns.template_id FK to SET NULL on delete
ALTER TABLE public.campaigns
  DROP CONSTRAINT campaigns_template_id_fkey,
  ADD CONSTRAINT campaigns_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES public.landing_page_templates(id)
    ON DELETE SET NULL;