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
    const { firstName, email, subject, bodyText } = await req.json();

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeSubject = (subject || "Personalized page info").slice(0, 200);
    
    // Convert plain text body to HTML paragraphs
    const rawBody = bodyText || `Hi ${firstName},\n\nThanks for signing up to learn more about Personalized Pages.`;
    const htmlBody = escapeHtml(rawBody)
      .split("\n")
      .map((line: string) => (line.trim() === "" ? "<br/>" : `<p style="margin: 4px 0;">${line}</p>`))
      .join("\n");

    const emailResponse = await resend.emails.send({
      from: "Paul <onboarding@resend.dev>",
      to: [email.slice(0, 255)],
      subject: safeSubject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.7;">
          ${htmlBody}
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
