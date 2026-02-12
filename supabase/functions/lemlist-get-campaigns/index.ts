import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { getLemlistApiKey } from "../_shared/get-lemlist-key.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LEMLIST_API = "https://api.lemlist.com/api";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");

    const userId = claimsData.claims.sub as string;
    const lemlistApiKey = await getLemlistApiKey(callerClient, userId);
    const basicAuth = btoa(`:${lemlistApiKey}`);

    const response = await fetch(`${LEMLIST_API}/campaigns`, {
      headers: { "Authorization": `Basic ${basicAuth}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LemList API error [${response.status}]: ${text}`);
    }

    const campaigns = await response.json();

    return new Response(JSON.stringify({ campaigns }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("lemlist-get-campaigns error:", error.message);
    const status = error.message === "LEMLIST_NOT_CONFIGURED" ? 404 : 400;
    return new Response(
      JSON.stringify({ error: error.message }),
      { status, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
