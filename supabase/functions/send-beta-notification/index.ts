import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (str: string): string => {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, email } = await req.json();

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeFirstName = escapeHtml(firstName.slice(0, 100));
    const safeEmail = escapeHtml(email.slice(0, 255));

    const emailResponse = await resend.emails.send({
      from: "Kicker Video <onboarding@resend.dev>",
      to: ["paul@kickervideo.com"],
      subject: `New Beta Signup: ${safeFirstName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            🚀 New Beta Interest Signup
          </h1>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${safeFirstName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Submitted via the beta interest form on the login page.</p>
        </div>
      `,
    });

    console.log("Beta notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-beta-notification:", error);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
