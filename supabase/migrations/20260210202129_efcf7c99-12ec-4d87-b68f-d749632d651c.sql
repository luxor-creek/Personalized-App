-- Remove the trigger first (correct name), then the function
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
DROP FUNCTION IF EXISTS public.send_welcome_email_on_signup();