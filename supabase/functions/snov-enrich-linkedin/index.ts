import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getSnovAccessToken(): Promise<string> {
  const userId = Deno.env.get("SNOV_USER_ID");
  const secret = Deno.env.get("SNOV_SECRET");
  if (!userId || !secret) throw new Error("Snov.io credentials not configured");

  const res = await fetch("https://api.snov.io/v1/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: userId,
      client_secret: secret,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get Snov.io access token");
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { linkedin_url } = await req.json();
    if (!linkedin_url || !linkedin_url.includes("linkedin.com")) {
      return new Response(JSON.stringify({ error: "Valid LinkedIn URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getSnovAccessToken();

    // Step 1: Start enrichment
    const startRes = await fetch("https://api.snov.io/v2/li-profiles-by-urls/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ urls: [linkedin_url] }),
    });

    const startData = await startRes.json();
    console.log("Snov enrichment start response:", JSON.stringify(startData));

    if (!startData.success && !startData.data?.task_hash) {
      // Try V1 fallback: get-emails-from-url
      console.log("V2 failed, trying V1 email finder by URL...");
      const v1Res = await fetch("https://api.snov.io/v1/get-profile-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token, url: linkedin_url }),
      });
      const v1Data = await v1Res.json();
      console.log("V1 fallback response:", JSON.stringify(v1Data));

      if (v1Data.data || v1Data.firstName) {
        const d = v1Data.data || v1Data;
        return new Response(JSON.stringify({
          success: true,
          contact: {
            first_name: d.firstName || d.first_name || "",
            last_name: d.lastName || d.last_name || "",
            email: d.emails?.[0]?.email || d.email || "",
            company: d.currentJob?.[0]?.companyName || d.company || "",
            job_title: d.currentJob?.[0]?.position || d.position || "",
            linkedin_url,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "No contact data found for this LinkedIn profile" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const taskHash = startData.data?.task_hash;

    // Step 2: Poll for results (up to 30s)
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const resultRes = await fetch(
        `https://api.snov.io/v2/li-profiles-by-urls/result?task_hash=${taskHash}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resultData = await resultRes.json();
      console.log(`Poll attempt ${i + 1}:`, JSON.stringify(resultData));

      if (resultData.data?.status === "completed" || resultData.data?.results?.length > 0) {
        const profile = resultData.data.results?.[0];
        if (!profile) {
          return new Response(JSON.stringify({ error: "No contact data found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          contact: {
            first_name: profile.firstName || profile.first_name || "",
            last_name: profile.lastName || profile.last_name || "",
            email: profile.emails?.[0]?.email || profile.email || "",
            company: profile.currentCompany || profile.company || "",
            job_title: profile.currentPosition || profile.position || "",
            linkedin_url,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (resultData.data?.status === "failed") {
        return new Response(JSON.stringify({ error: "Enrichment failed for this profile" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Enrichment timed out. Try again in a moment." }), {
      status: 408,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in snov-enrich-linkedin:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
