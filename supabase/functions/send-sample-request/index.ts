import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side length limits
const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  email: 100,
  company: 100,
  primaryGoal: 50,
  timeline: 20,
};

interface SampleRequest {
  firstName: string;
  lastName?: string;
  email: string;
  company: string;
  primaryGoal: string;
  timeline: string;
}

// HTML escape function to prevent XSS in email templates
const escapeHtml = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Truncate string to max length
const truncate = (str: string | undefined, maxLength: number): string => {
  if (!str) return "";
  return str.slice(0, maxLength);
};

const formatPrimaryGoal = (goal: string): string => {
  const goals: Record<string, string> = {
    "training-video": "Training Video",
    "executive-message": "Executive Message",
    "social-media-video": "Social Media Video",
    "quick-location-shoot": "Quick Location Shoot",
    "brand-video": "Brand Video",
    "explainer-video": "Explainer Video",
    "animated-video": "Animated Video",
  };
  return goals[goal] || escapeHtml(goal);
};

const formatTimeline = (timeline: string): string => {
  const timelines: Record<string, string> = {
    "this-week": "This Week",
    "next-week": "Next Week",
    "next-month": "Next Month",
    "no-rush": "No Rush",
  };
  return timelines[timeline] || escapeHtml(timeline);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Enforce server-side length limits and sanitize
    const firstName = truncate(body.firstName, MAX_LENGTHS.firstName);
    const lastName = truncate(body.lastName, MAX_LENGTHS.lastName);
    const email = truncate(body.email, MAX_LENGTHS.email);
    const company = truncate(body.company, MAX_LENGTHS.company);
    const primaryGoal = truncate(body.primaryGoal, MAX_LENGTHS.primaryGoal);
    const timeline = truncate(body.timeline, MAX_LENGTHS.timeline);

    // Validate required fields
    if (!firstName || !email || !company || !primaryGoal || !timeline) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: firstName, email, company, primaryGoal, and timeline are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // HTML escape all user input for the email template
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const fullName = safeLastName ? `${safeFirstName} ${safeLastName}` : safeFirstName;

    console.log("Sending sample request email for:", { company: safeCompany, primaryGoal, timeline });

    const emailResponse = await resend.emails.send({
      from: "Kicker Video <onboarding@resend.dev>",
      to: ["paul@kickervideo.com"],
      subject: `New Video Request from ${fullName} at ${safeCompany}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            🎬 New Video Request
          </h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${safeCompany}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Project Details</h2>
            <p style="margin: 8px 0;"><strong>Primary Goal:</strong> ${formatPrimaryGoal(primaryGoal)}</p>
            <p style="margin: 8px 0;"><strong>Timeline:</strong> ${formatTimeline(timeline)}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This request was submitted via the Kicker Video contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Request sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-sample-request function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
