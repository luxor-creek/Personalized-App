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

    const safeName = escapeHtml(firstName.slice(0, 100));

    const emailResponse = await resend.emails.send({
      from: "Paul <onboarding@resend.dev>",
      to: [email.slice(0, 255)],
      subject: "Personalized page info",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.7;">
          <p>Hi ${safeName},</p>

          <p>Thanks for signing up to learn more about Personalized Pages. The platform is currently in Beta but will be released soon at discounted pricing.</p>

          <h2 style="color: #1f2937; font-size: 18px; margin-top: 28px; margin-bottom: 16px;">How it works</h2>

          <ol style="padding-left: 20px; margin: 0 0 24px 0;">
            <li style="margin-bottom: 8px;">Log in and select a landing page template</li>
            <li style="margin-bottom: 8px;">Upload your email list</li>
            <li style="margin-bottom: 8px;">We generate a personalized landing page for every contact</li>
            <li style="margin-bottom: 8px;">Send your campaign using your existing sales or automation platform</li>
          </ol>

          <p>That's it. No custom builds. No one-off pages. Just fast, scalable personalization.</p>

          <p>I will send you an email once the platform is publicly available soon.</p>

          <p style="margin-top: 28px;">
            Take care,<br/>
            Paul
          </p>

          <p style="font-weight: 600; color: #374151;">Personalized.Pages</p>
        </div>
      `,
    });

    console.log("Beta info email sent to:", email, emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-beta-info-email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
