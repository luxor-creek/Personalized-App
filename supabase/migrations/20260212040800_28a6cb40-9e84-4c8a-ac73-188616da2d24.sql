
-- Create custom_variables table for user-defined personalization tokens
CREATE TABLE public.custom_variables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  fallback_value TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE public.custom_variables ENABLE ROW LEVEL SECURITY;

-- Users can view their own variables
CREATE POLICY "Users can view own variables"
ON public.custom_variables FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own variables
CREATE POLICY "Users can create own variables"
ON public.custom_variables FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own variables
CREATE POLICY "Users can update own variables"
ON public.custom_variables FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own variables
CREATE POLICY "Users can delete own variables"
ON public.custom_variables FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all variables
CREATE POLICY "Admins can view all variables"
ON public.custom_variables FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_custom_variables_updated_at
BEFORE UPDATE ON public.custom_variables
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
