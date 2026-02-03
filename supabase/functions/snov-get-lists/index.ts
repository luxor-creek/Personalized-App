import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching Snov.io lists...");

    // Get Snov.io access token
    const accessToken = await getSnovAccessToken();

    // Fetch all prospect lists
    const response = await fetch("https://api.snov.io/v1/get-user-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch lists:", error);
      throw new Error(`Failed to fetch Snov.io lists: ${error}`);
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
