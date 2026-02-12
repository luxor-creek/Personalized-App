import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getSnovCredentials, getSnovAccessToken } from "../_shared/get-snov-credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getSnovBalance(accessToken: string): Promise<unknown> {
  try {
    const params = new URLSearchParams();
    params.append("access_token", accessToken);
    const res = await fetch(`https://api.snov.io/v1/get-balance?${params.toString()}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { status: res.status, body: text }; }
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}

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
    console.log(`Fetching Snov.io lists for user ${userId}...`);

    const { clientId, clientSecret } = await getSnovCredentials(supabase, userId);
    const accessToken = await getSnovAccessToken(clientId, clientSecret);

    const params = new URLSearchParams();
    params.append("access_token", accessToken);

    const response = await fetch(`https://api.snov.io/v1/get-user-lists?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch lists:", errorText);
      const balance = await getSnovBalance(accessToken);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch Snov.io lists: ${errorText}`,
          snov_balance_debug: balance,
          hint: "Snov.io returned a permissions error for this endpoint. This usually means the account/plan doesn't have API access to lists.",
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const listsArray = await response.json();
    console.log(`Fetched ${Array.isArray(listsArray) ? listsArray.length : 0} lists`);

    return new Response(
      JSON.stringify({ success: true, lists: Array.isArray(listsArray) ? listsArray : [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in snov-get-lists:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
