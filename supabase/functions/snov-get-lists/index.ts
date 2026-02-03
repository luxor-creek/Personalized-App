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

interface SnovList {
  id: number;
  name: string;
  contacts: number;
  isPrivate: boolean;
  deletable: boolean;
  creationDate: { date: string };
}

interface SnovListsResponse {
  success: boolean;
  data: SnovList[];
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

async function getSnovBalance(accessToken: string): Promise<unknown> {
  try {
    const params = new URLSearchParams();
    params.append("access_token", accessToken);

    const res = await fetch(`https://api.snov.io/v1/get-balance?${params.toString()}`, {
      method: "GET",
    });

    // If this fails, just return the raw body so we can debug permissions.
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: res.status, body: text };
    }
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated (signing keys compatible)
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

    console.log(`Fetching Snov.io lists for user ${claimsData.claims.sub}...`);

    // Get Snov.io access token
    const accessToken = await getSnovAccessToken();

    // Fetch all prospect lists - Snov.io expects access_token in the body, not as Bearer header
    const formData = new URLSearchParams();
    formData.append("access_token", accessToken);

    const response = await fetch("https://api.snov.io/v1/get-user-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch lists:", errorText);

      // Helpful diagnostics: check whether token is valid at all.
      const balance = await getSnovBalance(accessToken);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch Snov.io lists: ${errorText}`,
          snov_balance_debug: balance,
          hint:
            "Snov.io returned a permissions error for this endpoint. This usually means the account/plan doesn't have API access to lists, even if authentication succeeds.",
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: SnovListsResponse = await response.json();
    console.log(`Fetched ${data.data?.length || 0} lists`);

    return new Response(
      JSON.stringify({
        success: true,
        lists: data.data || [],
      }),
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
