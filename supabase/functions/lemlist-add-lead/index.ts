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

    const { campaignId, email, firstName, lastName, company, customFields } = await req.json();
    if (!campaignId || !email) throw new Error("campaignId and email are required");

    const basicAuth = btoa(`:${lemlistApiKey}`);

    const leadData: Record<string, unknown> = { email };
    if (firstName) leadData.firstName = firstName;
    if (lastName) leadData.lastName = lastName;
    if (company) leadData.companyName = company;
    if (customFields) Object.assign(leadData, customFields);

    const response = await fetch(`${LEMLIST_API}/campaigns/${campaignId}/leads`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LemList API error [${response.status}]: ${text}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, lead: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("lemlist-add-lead error:", error.message);
    const status = error.message === "LEMLIST_NOT_CONFIGURED" ? 404 : 400;
    return new Response(
      JSON.stringify({ error: error.message }),
      { status, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
