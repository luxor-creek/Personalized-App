
-- Cache table for AI assistant answers
CREATE TABLE public.chat_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  question_normalized text NOT NULL,
  answer text NOT NULL,
  category text,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_chat_cache_normalized ON public.chat_cache (question_normalized);
CREATE INDEX idx_chat_cache_category ON public.chat_cache (category);

-- Enable RLS
ALTER TABLE public.chat_cache ENABLE ROW LEVEL SECURITY;

-- Everyone can read cached answers (public knowledge base)
CREATE POLICY "Anyone can read chat cache"
  ON public.chat_cache FOR SELECT
  USING (true);

-- Only system/admin can insert/update (edge function uses service role)
CREATE POLICY "Service role manages cache"
  ON public.chat_cache FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
