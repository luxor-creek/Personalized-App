import { useNavigate } from "react-router-dom";
import { AlertTriangle, Crown, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UsageLimitBannerProps {
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

const UsageLimitBanner = ({
  plan, trialExpired, trialDaysLeft,
  pageCount, maxPages, campaignCount, maxCampaigns,
  canCreatePage, canCreateCampaign, isUnlimited,
}: UsageLimitBannerProps) => {
  const navigate = useNavigate();

  // Trial expired
  if (trialExpired) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Your free trial has expired</p>
          <p className="text-sm text-muted-foreground">
            Upgrade to continue creating campaigns and personalized pages.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/pricing")}>
          <Crown className="w-4 h-4 mr-1" />Upgrade
        </Button>
      </div>
    );
  }

  // Trial active with warning
  if (plan === "trial" && trialDaysLeft !== null && trialDaysLeft <= 3) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {trialDaysLeft === 0 ? "Trial expires today" : `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left on your trial`}
          </p>
          <p className="text-sm text-muted-foreground">
            {pageCount}/{isUnlimited ? "∞" : maxPages} pages · {campaignCount}/{isUnlimited ? "∞" : maxCampaigns} campaigns
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
          View Plans
        </Button>
      </div>
    );
  }

  // Approaching limits (>80% usage)
  const pageUsagePercent = isUnlimited ? 0 : (pageCount / maxPages) * 100;
  const campaignUsagePercent = isUnlimited ? 0 : (campaignCount / maxCampaigns) * 100;
  const nearLimit = !isUnlimited && (pageUsagePercent >= 80 || campaignUsagePercent >= 80);

  if (nearLimit) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Approaching plan limits</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
            Upgrade
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Pages</span>
              <span>{pageCount}/{maxPages}</span>
            </div>
            <Progress value={pageUsagePercent} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Campaigns</span>
              <span>{campaignCount}/{maxCampaigns}</span>
            </div>
            <Progress value={campaignUsagePercent} className="h-1.5" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UsageLimitBanner;
