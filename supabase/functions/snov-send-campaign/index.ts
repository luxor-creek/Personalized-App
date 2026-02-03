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

interface SendCampaignRequest {
  listId: number;           // Snov.io source list ID to get prospects from
  campaignId: string;       // Our internal campaign ID for personalized pages
  snovCampaignListId: number; // Snov.io list ID that has the drip campaign attached
  templateId?: string;
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

// Add prospect to Snov.io list (triggers drip campaign automatically)
async function addProspectToSnovList(
  accessToken: string,
  listId: number,
  prospect: {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    landingPageUrl: string;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log(`Adding prospect ${prospect.email} to Snov.io list ${listId}...`);

  const formData = new URLSearchParams();
  formData.append("access_token", accessToken);
  formData.append("email", prospect.email);
  formData.append("firstName", prospect.firstName);
  formData.append("lastName", prospect.lastName);
  formData.append("listId", listId.toString());
  formData.append("updateContact", "true");
  
  // Add company if available
  if (prospect.company) {
    formData.append("companyName", prospect.company);
  }
  
  // Use the "country" field to pass the personalized landing page URL
  // This is a workaround since country is a built-in Snov.io field that can be used as {{country}} in templates
  formData.append("country", prospect.landingPageUrl);

  const response = await fetch("https://api.snov.io/v1/add-prospect-to-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const responseText = await response.text();
  console.log(`Add prospect response for ${prospect.email}:`, responseText.slice(0, 300));

  if (!response.ok) {
    console.error(`Failed to add prospect ${prospect.email}:`, responseText);
    return { success: false, error: responseText };
  }

  try {
    const data = JSON.parse(responseText);
    if (data.success) {
      console.log(`Prospect ${prospect.email} added successfully`);
      return { success: true };
    } else {
      return { success: false, error: data.message || "Unknown error" };
    }
  } catch {
    // If response is not JSON but status was OK
    return { success: true };
  }
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
      snovCampaignListId,
      templateId,
    }: SendCampaignRequest = await req.json();

    // Validate required fields
    if (!listId || !campaignId || !snovCampaignListId) {
      throw new Error("Missing required fields: listId (source list), campaignId (internal), snovCampaignListId (target list with drip campaign)");
    }

    console.log(`Starting campaign send: source list ${listId} -> target list ${snovCampaignListId}, internal campaign ${campaignId}`);

    // Get Snov.io access token
    const accessToken = await getSnovAccessToken();

    // Get prospects from the source list
    const prospects = await getProspectsFromList(accessToken, listId);

    if (prospects.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No prospects found in list", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the base URL for personalized pages from environment variable
    const baseUrl = Deno.env.get("SITE_BASE_URL") || "https://video.kickervideo.com";

    let addedCount = 0;
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
        const firstName = prospect.firstName || prospect.name?.split(" ")[0] || "Friend";
        const lastName = prospect.lastName || prospect.name?.split(" ").slice(1).join(" ") || null;

        const { data: pageData, error: pageError } = await supabase
          .from("personalized_pages")
          .insert({
            campaign_id: campaignId,
            first_name: firstName,
            last_name: lastName,
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

        // Add prospect to the Snov.io list with drip campaign
        const addResult = await addProspectToSnovList(accessToken, snovCampaignListId, {
          email: primaryEmail,
          firstName,
          lastName: lastName || "",
          company: prospect.company,
          landingPageUrl: pageUrl,
        });

        if (addResult.success) {
          addedCount++;
          results.push({ email: primaryEmail, success: true, pageUrl });
        } else {
          errorCount++;
          results.push({ email: primaryEmail, success: false, pageUrl, error: addResult.error });
        }

        // Rate limiting - wait 300ms between API calls
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error processing prospect ${primaryEmail}:`, error);
        results.push({ email: primaryEmail, success: false, error: errorMessage });
        errorCount++;
      }
    }

    console.log(`Campaign complete. Added to Snov.io list: ${addedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${addedCount} prospects to Snov.io drip campaign list`,
        added: addedCount,
        errors: errorCount,
        total: prospects.length,
        snovCampaignListId,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in snov-send-campaign:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
