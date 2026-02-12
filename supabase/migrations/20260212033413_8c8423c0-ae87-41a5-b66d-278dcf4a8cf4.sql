
-- Table to store per-user integration credentials (e.g. LemList API keys)
CREATE TABLE public.integration_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,  -- e.g. 'lemlist', 'snov'
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,  -- e.g. {"api_key": "xxx"}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credentials
CREATE POLICY "Users can view own credentials"
ON public.integration_credentials FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users can insert own credentials"
ON public.integration_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users can update own credentials"
ON public.integration_credentials FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete own credentials"
ON public.integration_credentials FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all credentials (for support/debugging)
CREATE POLICY "Admins can view all credentials"
ON public.integration_credentials FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_integration_credentials_updated_at
BEFORE UPDATE ON public.integration_credentials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
