import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
  productUrl: 500,
  phone: 30,
  address: 200,
  city: 100,
  state: 50,
  zip: 20,
};

interface SampleRequest {
  firstName: string;
  lastName?: string;
  email: string;
  company: string;
  primaryGoal?: string;
  productUrl: string;
  templateId?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  recipientEmail?: string;
  extraFields?: Record<string, string>;
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
    "free-demo": "Free Demo",
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const firstName = truncate(body.firstName, MAX_LENGTHS.firstName);
    const lastName = truncate(body.lastName, MAX_LENGTHS.lastName);
    const email = truncate(body.email, MAX_LENGTHS.email);
    const company = truncate(body.company, MAX_LENGTHS.company);
    const primaryGoal = truncate(body.primaryGoal, MAX_LENGTHS.primaryGoal);
    const productUrl = truncate(body.productUrl, MAX_LENGTHS.productUrl);
    const phone = truncate(body.phone, MAX_LENGTHS.phone);
    const address = truncate(body.address, MAX_LENGTHS.address);
    const city = truncate(body.city, MAX_LENGTHS.city);
    const state = truncate(body.state, MAX_LENGTHS.state);
    const zip = truncate(body.zip, MAX_LENGTHS.zip);
    const templateId = body.templateId;
    const recipientEmail = body.recipientEmail;
    const extraFields = body.extraFields || {};

    // Validate required fields
    if (!firstName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: firstName and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Save to database if templateId provided
    if (templateId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from("form_submissions").insert({
          template_id: templateId,
          first_name: firstName || null,
          last_name: lastName || null,
          email: email || null,
          company: company || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          primary_goal: primaryGoal || null,
          product_url: productUrl || null,
          extra_fields: Object.keys(extraFields).length > 0 ? extraFields : null,
        });
      } catch (dbErr) {
        console.error("Error saving to DB:", dbErr);
        // Don't fail the whole request if DB save fails
      }
    }

    // HTML escape all user input for the email template
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const fullName = safeLastName ? `${safeFirstName} ${safeLastName}` : safeFirstName;
    const safeProductUrl = escapeHtml(productUrl);

    const toEmail = recipientEmail && emailRegex.test(recipientEmail) ? recipientEmail : "paul@kickervideo.com";

    console.log("Sending sample request email for:", { company: safeCompany, primaryGoal, productUrl, to: toEmail });

    const emailResponse = await resend.emails.send({
      from: "Kicker Video <onboarding@resend.dev>",
      to: [toEmail],
      subject: `New Video Request from ${fullName}${safeCompany ? ` at ${safeCompany}` : ''}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            🎬 New Video Request
          </h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Contact Information</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
            ${safeCompany ? `<p style="margin: 8px 0;"><strong>Company:</strong> ${safeCompany}</p>` : ''}
            ${phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
            ${address ? `<p style="margin: 8px 0;"><strong>Address:</strong> ${escapeHtml(address)}</p>` : ''}
            ${city || state || zip ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${[city, state, zip].filter(Boolean).map(escapeHtml).join(', ')}</p>` : ''}
          </div>
          
          ${primaryGoal || productUrl ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Project Details</h2>
            ${primaryGoal ? `<p style="margin: 8px 0;"><strong>Primary Goal:</strong> ${formatPrimaryGoal(primaryGoal)}</p>` : ''}
            ${safeProductUrl ? `<p style="margin: 8px 0;"><strong>Product URL:</strong> <a href="${safeProductUrl}" style="color: #2563eb;">${safeProductUrl}</a></p>` : ''}
          </div>` : ''}
          
          ${Object.keys(extraFields).length > 0 ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Additional Information</h2>
            ${Object.entries(extraFields).map(([k, v]) => `<p style="margin: 8px 0;"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</p>`).join('')}
          </div>` : ''}
          
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
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
