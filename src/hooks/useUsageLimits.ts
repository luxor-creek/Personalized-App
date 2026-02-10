import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsageLimits {
  plan: string;
  trialExpired: boolean;
  trialDaysLeft: number | null;
  pageCount: number;
  maxPages: number;
  campaignCount: number;
  maxCampaigns: number;
  canCreatePage: boolean;
  canCreateCampaign: boolean;
  isUnlimited: boolean;
}

export function useUsageLimits(userId: string | undefined) {
  const [limits, setLimits] = useState<UsageLimits>({
    plan: "trial",
    trialExpired: false,
    trialDaysLeft: null,
    pageCount: 0,
    maxPages: 3,
    campaignCount: 0,
    maxCampaigns: 1,
    canCreatePage: true,
    canCreateCampaign: true,
    isUnlimited: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, trial_ends_at, max_pages, max_campaigns")
        .eq("user_id", userId)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Get current counts
      const { count: campaignCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: pageCount } = await supabase
        .from("personalized_pages")
        .select("*, campaigns!inner(user_id)", { count: "exact", head: true })
        .eq("campaigns.user_id", userId);

      const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
      const trialExpired = profile.plan === "trial" && trialEndsAt !== null && trialEndsAt < new Date();
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      const maxPages = profile.max_pages;
      const maxCampaigns = profile.max_campaigns;
      const currentPages = pageCount || 0;
      const currentCampaigns = campaignCount || 0;
      const isUnlimited = maxPages >= 999999;

      setLimits({
        plan: profile.plan,
        trialExpired,
        trialDaysLeft,
        pageCount: currentPages,
        maxPages,
        campaignCount: currentCampaigns,
        maxCampaigns,
        canCreatePage: !trialExpired && (isUnlimited || currentPages < maxPages),
        canCreateCampaign: !trialExpired && (isUnlimited || currentCampaigns < maxCampaigns),
        isUnlimited,
      });
    } catch (err) {
      console.error("Error fetching usage limits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [userId]);

  return { ...limits, loading, refetchLimits: fetchLimits };
}
