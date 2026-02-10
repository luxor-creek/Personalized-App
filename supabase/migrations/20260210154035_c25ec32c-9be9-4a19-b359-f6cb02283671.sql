-- Create a function that calls the welcome email edge function via pg_net
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  supabase_url text;
BEGIN
  -- Build payload from the new profile
  payload := jsonb_build_object(
    'email', NEW.email,
    'full_name', COALESCE(NEW.full_name, '')
  );

  -- Get the supabase URL from the project config
  supabase_url := 'https://lzxbhriamrnbfsymouyg.supabase.co';

  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eGJocmlhbXJuYmZzeW1vdXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTIxNDIsImV4cCI6MjA4NTY2ODE0Mn0.6GUTKKHh-jE_rXccb1_wyHQdqoVrOYOdqrMRKHdDGEI'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();

-- Add columns to track email notification state (prevents duplicate sends)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_reminder_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_expired_email_sent boolean DEFAULT false;