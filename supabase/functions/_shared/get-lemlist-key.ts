import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

/**
 * Fetch the calling user's LemList API key from integration_credentials.
 * Falls back to the global LEMLIST_API_KEY env var (admin/legacy).
 */
export async function getLemlistApiKey(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<string> {
  // Try per-user credential first
  const { data } = await supabaseClient
    .from("integration_credentials")
    .select("credentials")
    .eq("user_id", userId)
    .eq("provider", "lemlist")
    .maybeSingle();

  const userKey = data?.credentials?.api_key as string | undefined;
  if (userKey && userKey.trim().length > 0) return userKey.trim();

  // Fallback to global env var
  const globalKey = Deno.env.get("LEMLIST_API_KEY");
  if (globalKey && globalKey.trim().length > 0) return globalKey.trim();

  throw new Error("LEMLIST_NOT_CONFIGURED");
}
