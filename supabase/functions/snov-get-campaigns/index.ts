import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getSnovCredentials, getSnovAccessToken } from "../_shared/get-snov-credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "").trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(jwt);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`Fetching Snov.io campaigns for user ${userId}...`);

    const { clientId, clientSecret } = await getSnovCredentials(supabase, userId);
    const accessToken = await getSnovAccessToken(clientId, clientSecret);

    const params = new URLSearchParams();
    params.append("access_token", accessToken);

    const response = await fetch(`https://api.snov.io/v1/get-user-campaigns?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch campaigns:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch Snov.io campaigns: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const campaignsArray = await response.json();
    console.log(`Fetched ${Array.isArray(campaignsArray) ? campaignsArray.length : 0} campaigns`);

    const formattedCampaigns = Array.isArray(campaignsArray)
      ? campaignsArray.map((c: any) => ({
          id: c.id,
          name: c.campaign,
          listId: c.list_id,
          status: c.status,
          createdAt: c.created_at ? new Date(c.created_at * 1000).toISOString() : null,
          startedAt: c.started_at ? new Date(c.started_at * 1000).toISOString() : null,
        }))
      : [];

    return new Response(
      JSON.stringify({ success: true, campaigns: formattedCampaigns }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in snov-get-campaigns:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
