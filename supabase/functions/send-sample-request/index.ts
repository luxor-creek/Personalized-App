import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SampleRequest {
  firstName: string;
  lastName?: string;
  email: string;
  company: string;
  primaryGoal: string;
  timeline: string;
}

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
  return goals[goal] || goal;
};

const formatTimeline = (timeline: string): string => {
  const timelines: Record<string, string> = {
    "this-week": "This Week",
    "next-week": "Next Week",
    "next-month": "Next Month",
    "no-rush": "No Rush",
  };
  return timelines[timeline] || timeline;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, company, primaryGoal, timeline }: SampleRequest = await req.json();

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

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    console.log("Sending sample request email:", { firstName, lastName, email, company, primaryGoal, timeline });

    const emailResponse = await resend.emails.send({
      from: "Kicker Video <onboarding@resend.dev>",
      to: ["paul@kickervideo.com"],
      subject: `New Video Request from ${fullName} at ${company}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            🎬 New Video Request
          </h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${company}</p>
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
      JSON.stringify({ error: error.message || "Failed to send request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
