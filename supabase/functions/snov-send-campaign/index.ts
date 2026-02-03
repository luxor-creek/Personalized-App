import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SnovAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SnovProspect {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  emails: Array<{ email: string; status: string }>;
  locality?: string;
  company?: string;
}

interface SnovListResponse {
  success: boolean;
  data: SnovProspect[];
  lastId?: number;
}

interface SendCampaignRequest {
  listId: number;
  campaignId: string;
  templateId?: string;
  emailSubject: string;
  emailBody: string;
  fromEmail: string;
  fromName: string;
}

// Get Snov.io access token
async function getSnovAccessToken(): Promise<string> {
  const clientId = Deno.env.get("SNOV_USER_ID");
  const clientSecret = Deno.env.get("SNOV_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Snov.io credentials not configured");
  }

  console.log("Authenticating with Snov.io...");

  const response = await fetch("https://api.snov.io/v1/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Snov.io auth failed:", error);
    throw new Error(`Snov.io authentication failed: ${error}`);
  }

  const data: SnovAuthResponse = await response.json();
  console.log("Snov.io authentication successful");
  return data.access_token;
}

// Get prospects from a Snov.io list
async function getProspectsFromList(
  accessToken: string,
  listId: number
): Promise<SnovProspect[]> {
  console.log(`Fetching prospects from list ${listId}...`);

  const allProspects: SnovProspect[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    // Snov.io expects form-encoded POST with access_token in body
    const formData = new URLSearchParams();
    formData.append("access_token", accessToken);
    formData.append("listId", listId.toString());
    formData.append("page", page.toString());
    formData.append("perPage", "100");

    const response = await fetch("https://api.snov.io/v1/prospect-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch prospects:", error);
      throw new Error(`Failed to fetch prospects: ${error}`);
    }

    const data = await response.json();
    console.log(`Page ${page} response:`, JSON.stringify(data).slice(0, 500));

    // Response format: { success: true, list: {...}, prospects: [...] }
    if (data.prospects && data.prospects.length > 0) {
      allProspects.push(...data.prospects);
      console.log(`Fetched ${data.prospects.length} prospects, total: ${allProspects.length}`);
      page++;
    } else {
      hasMore = false;
    }

    // Safety limit
    if (allProspects.length >= 1000) {
      console.log("Reached 1000 prospect limit");
      hasMore = false;
    }
  }

  console.log(`Total prospects fetched: ${allProspects.length}`);
  return allProspects;
}

// Send email via Snov.io transactional API
async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  fromEmail: string,
  fromName: string
): Promise<boolean> {
  console.log(`Sending email to ${to}...`);

  const response = await fetch("https://api.snov.io/v1/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email: to,
      subject,
      message: body,
      fromEmail,
      fromName,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }

  console.log(`Email sent successfully to ${to}`);
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      listId,
      campaignId,
      templateId,
      emailSubject,
      emailBody,
      fromEmail,
      fromName,
    }: SendCampaignRequest = await req.json();

    // Validate required fields
    if (!listId || !campaignId || !emailSubject || !emailBody || !fromEmail || !fromName) {
      throw new Error("Missing required fields: listId, campaignId, emailSubject, emailBody, fromEmail, fromName");
    }

    console.log(`Starting campaign send for list ${listId}, campaign ${campaignId}`);

    // Get Snov.io access token
    const accessToken = await getSnovAccessToken();

    // Get prospects from the list
    const prospects = await getProspectsFromList(accessToken, listId);

    if (prospects.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No prospects found in list", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Get the base URL for personalized pages from environment variable
    const baseUrl = Deno.env.get("SITE_BASE_URL") || "https://video.kickervideo.com";

    let sentCount = 0;
    let errorCount = 0;
    const results: Array<{ email: string; success: boolean; pageUrl?: string; error?: string }> = [];

    for (const prospect of prospects) {
      // Get primary email
      const primaryEmail = prospect.emails?.find(e => e.status === "valid")?.email || 
                          prospect.emails?.[0]?.email;

      if (!primaryEmail) {
        console.log(`Skipping prospect ${prospect.id} - no valid email`);
        results.push({ email: "unknown", success: false, error: "No valid email" });
        errorCount++;
        continue;
      }

      try {
        // Create a personalized page for this prospect
        const { data: pageData, error: pageError } = await supabase
          .from("personalized_pages")
          .insert({
            campaign_id: campaignId,
            first_name: prospect.firstName || prospect.name?.split(" ")[0] || "Friend",
            last_name: prospect.lastName || prospect.name?.split(" ").slice(1).join(" ") || null,
            company: prospect.company || null,
            template_id: templateId || null,
          })
          .select("token")
          .single();

        if (pageError) {
          console.error(`Failed to create page for ${primaryEmail}:`, pageError);
          results.push({ email: primaryEmail, success: false, error: pageError.message });
          errorCount++;
          continue;
        }

        const pageUrl = `${baseUrl}/view/${pageData.token}`;

        // Replace placeholders in email body
        let personalizedBody = emailBody
          .replace(/{{first_name}}/gi, prospect.firstName || prospect.name?.split(" ")[0] || "Friend")
          .replace(/{{last_name}}/gi, prospect.lastName || "")
          .replace(/{{company}}/gi, prospect.company || "")
          .replace(/{{page_url}}/gi, pageUrl)
          .replace(/{{landing_page_url}}/gi, pageUrl);

        let personalizedSubject = emailSubject
          .replace(/{{first_name}}/gi, prospect.firstName || prospect.name?.split(" ")[0] || "Friend")
          .replace(/{{last_name}}/gi, prospect.lastName || "")
          .replace(/{{company}}/gi, prospect.company || "");

        // Send the email
        const sent = await sendEmail(
          accessToken,
          primaryEmail,
          personalizedSubject,
          personalizedBody,
          fromEmail,
          fromName
        );

        if (sent) {
          sentCount++;
          results.push({ email: primaryEmail, success: true, pageUrl });
        } else {
          errorCount++;
          results.push({ email: primaryEmail, success: false, error: "Email send failed" });
        }

        // Rate limiting - wait 500ms between emails
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`Error processing prospect ${primaryEmail}:`, error);
        results.push({ email: primaryEmail, success: false, error: error.message });
        errorCount++;
      }
    }

    console.log(`Campaign complete. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Campaign sent to ${sentCount} contacts`,
        sent: sentCount,
        errors: errorCount,
        total: prospects.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in snov-send-campaign:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
