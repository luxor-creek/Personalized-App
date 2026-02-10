import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: "page" | "campaign";
  currentPlan: string;
  trialExpired?: boolean;
}

const UpgradeDialog = ({ open, onOpenChange, resourceType, currentPlan, trialExpired }: UpgradeDialogProps) => {
  const navigate = useNavigate();

  const resourceLabel = resourceType === "page" ? "personalized pages" : "campaigns";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {trialExpired ? (
              <><Lock className="w-5 h-5 text-destructive" />Trial Expired</>
            ) : (
              <><Crown className="w-5 h-5 text-primary" />Upgrade Required</>
            )}
          </DialogTitle>
          <DialogDescription>
            {trialExpired
              ? `Your free trial has ended. Upgrade to continue creating ${resourceLabel} and keep your existing pages live.`
              : `You've reached the maximum number of ${resourceLabel} on your ${currentPlan} plan. Upgrade to get more.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Starter — $29/mo</span>
              <span className="text-xs text-muted-foreground">25 pages, 50 campaigns</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Pro — $59/mo</span>
              <span className="text-xs text-muted-foreground">Unlimited everything</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => { onOpenChange(false); navigate("/pricing"); }}>
            <Crown className="w-4 h-4 mr-2" />View Plans & Upgrade
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
