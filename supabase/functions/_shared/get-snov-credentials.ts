import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

/**
 * Fetch the calling user's Snov.io credentials from integration_credentials.
 * Falls back to the global SNOV_USER_ID / SNOV_SECRET env vars (admin/legacy).
 */
export async function getSnovCredentials(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<{ clientId: string; clientSecret: string }> {
  // Try per-user credential first
  const { data } = await supabaseClient
    .from("integration_credentials")
    .select("credentials")
    .eq("user_id", userId)
    .eq("provider", "snov")
    .maybeSingle();

  const userClientId = data?.credentials?.user_id as string | undefined;
  const userSecret = data?.credentials?.secret as string | undefined;

  if (userClientId?.trim() && userSecret?.trim()) {
    return { clientId: userClientId.trim(), clientSecret: userSecret.trim() };
  }

  // Fallback to global env vars
  const globalId = Deno.env.get("SNOV_USER_ID");
  const globalSecret = Deno.env.get("SNOV_SECRET");

  if (globalId?.trim() && globalSecret?.trim()) {
    return { clientId: globalId.trim(), clientSecret: globalSecret.trim() };
  }

  throw new Error("SNOV_NOT_CONFIGURED");
}

/**
 * Get Snov.io access token using client credentials.
 */
export async function getSnovAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
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

  const data = await response.json();
  if (!data.access_token) throw new Error("Failed to get Snov.io access token");
  return data.access_token;
}
