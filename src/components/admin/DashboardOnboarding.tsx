import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

type OnboardingState = "no-pages" | "has-draft" | "first-publish" | "active" | null;

interface DashboardOnboardingProps {
  /** User's own template count */
  templateCount: number;
  /** Set of template IDs that are live (linked to campaigns with pages) */
  liveTemplateIds: Set<string>;
  /** Number of campaigns with at least one personalized page */
  activeCampaignCount: number;
  /** Total personalized links generated */
  totalLinks: number;
  /** Callback when user dismisses onboarding */
  onDismiss?: () => void;
  /** Callback to navigate to campaigns tab */
  onGoToCampaigns?: () => void;
}

function getOnboardingState(props: DashboardOnboardingProps): OnboardingState {
  const { templateCount, liveTemplateIds, activeCampaignCount, totalLinks } = props;

  // State 4: Active user — campaign exists with links
  if (activeCampaignCount > 0 && totalLinks > 0) return "active";

  // State 3: First publish — has live template but no campaign links yet
  if (liveTemplateIds.size > 0 && totalLinks === 0) return "first-publish";

  // State 1: No pages exist
  if (templateCount === 0) return "no-pages";

  // State 2: Has templates but none are live
  if (templateCount > 0 && liveTemplateIds.size === 0) return "has-draft";

  return null;
}

export default function DashboardOnboarding(props: DashboardOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);
  const state = getOnboardingState(props);

  if (dismissed || state === "active" || state === null) return null;

  const handleDismiss = () => {
    setDismissed(true);
    props.onDismiss?.();
  };

  if (state === "no-pages") {
    return (
      <div className="relative rounded-xl border border-border bg-primary/[0.03] p-8">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start justify-between gap-8">
          {/* Left: Text content */}
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Build your first personalized landing page.
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create once. Generate unique versions for every contact.
            </p>

            <div className="flex items-center gap-3">
              <Link to="/builder">
                <Button>
                  Start with a Template
                </Button>
              </Link>
              <Link
                to="/builder"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start from Scratch
              </Link>
            </div>
          </div>

          {/* Right: 3-step progress */}
          <div className="hidden sm:flex items-center gap-4 pt-1">
            {["Choose a template", "Customize your content", "Publish"].map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">{step}</span>
                {i < 2 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "has-draft") {
    return (
      <div className="relative flex items-center justify-between rounded-lg border border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground">
              Your page is ready to publish.
            </p>
            <p className="text-sm text-muted-foreground">
              Publishing lets you generate personalized links.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link to="/builder">Open Draft</Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (state === "first-publish") {
    return (
      <div className="relative flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Your page is live.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now generate personalized versions for your contacts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={props.onGoToCampaigns}>
            Create Campaign
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
