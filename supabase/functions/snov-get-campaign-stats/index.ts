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

async function getSnovAccessToken(): Promise<string> {
  const clientId = Deno.env.get("SNOV_USER_ID");
  const clientSecret = Deno.env.get("SNOV_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Snov.io credentials not configured");
  }

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
    throw new Error(`Snov.io authentication failed: ${error}`);
  }

  const data: SnovAuthResponse = await response.json();
  return data.access_token;
}

async function fetchCampaignAnalytics(
  accessToken: string,
  snovCampaignId?: number
): Promise<unknown> {
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  if (snovCampaignId) {
    params.append("campaign_id", snovCampaignId.toString());
  }

  const response = await fetch(
    `https://api.snov.io/v2/statistics/campaign-analytics?${params.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Campaign analytics failed:", error);
    throw new Error(`Failed to fetch campaign analytics: ${error}`);
  }

  return response.json();
}

async function fetchCampaignReplies(
  accessToken: string,
  snovCampaignId: number
): Promise<unknown> {
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("campaign_id", snovCampaignId.toString());

  const response = await fetch(
    `https://api.snov.io/v1/campaigns/${snovCampaignId}/replies?${params.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Campaign replies failed:", error);
    return { replies: [] };
  }

  return response.json();
}

async function fetchCampaignOpens(
  accessToken: string,
  snovCampaignId: number
): Promise<unknown> {
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("campaign_id", snovCampaignId.toString());

  const response = await fetch(
    `https://api.snov.io/v1/campaigns/${snovCampaignId}/opened?${params.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Campaign opens failed:", error);
    return { recipients: [] };
  }

  return response.json();
}

async function fetchCampaignClicks(
  accessToken: string,
  snovCampaignId: number
): Promise<unknown> {
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("campaign_id", snovCampaignId.toString());

  const response = await fetch(
    `https://api.snov.io/v1/campaigns/${snovCampaignId}/link-clicks?${params.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Campaign clicks failed:", error);
    return { recipients: [] };
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const jwt = authHeader.replace("Bearer ", "").trim();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(jwt);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request - accept optional snovCampaignId
    const url = new URL(req.url);
    const snovCampaignIdParam = url.searchParams.get("snovCampaignId");
    const snovCampaignId = snovCampaignIdParam ? parseInt(snovCampaignIdParam, 10) : undefined;

    console.log(`Fetching Snov.io stats${snovCampaignId ? ` for campaign ${snovCampaignId}` : " (all campaigns)"}...`);

    const accessToken = await getSnovAccessToken();

    // Fetch analytics (overview)
    const analytics = await fetchCampaignAnalytics(accessToken, snovCampaignId);

    // If a specific campaign is requested, also fetch detailed engagement
    let replies = null;
    let opens = null;
    let clicks = null;

    if (snovCampaignId) {
      [replies, opens, clicks] = await Promise.all([
        fetchCampaignReplies(accessToken, snovCampaignId),
        fetchCampaignOpens(accessToken, snovCampaignId),
        fetchCampaignClicks(accessToken, snovCampaignId),
      ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analytics,
        replies,
        opens,
        clicks,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in snov-get-campaign-stats:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
