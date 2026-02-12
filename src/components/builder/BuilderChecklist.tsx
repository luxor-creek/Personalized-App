import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, X, Sparkles } from "lucide-react";
import { BuilderSection } from "@/types/builder";

const STORAGE_KEY = "builder_checklist_completed";

// Default headline texts from SECTION_DEFAULTS that indicate unchanged content
const DEFAULT_HEADLINES = new Set([
  "Your Headline Here",
  "Build Something Amazing",
  "Banner Headline",
  "Ready to get started?",
]);

interface BuilderChecklistProps {
  sections: BuilderSection[];
  hasPreviewedOnce: boolean;
  hasPublished: boolean;
  onFocusHeadline?: () => void;
  onFocusVariables?: () => void;
  onTriggerPreview?: () => void;
  onTriggerPublish?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  onClick?: () => void;
}

function detectHeadlineChanged(sections: BuilderSection[]): boolean {
  for (const section of sections) {
    // Check main text field on headline-like sections
    if (["headline", "hero", "heroBg", "heroVideo", "heroImage", "heroForm", "heroVideoBg"].includes(section.type)) {
      const text = section.content.text?.trim();
      if (text && !DEFAULT_HEADLINES.has(text)) return true;
    }
    // Check column children
    if (section.content.columnChildren) {
      for (const col of section.content.columnChildren) {
        if (detectHeadlineChanged(col)) return true;
      }
    }
  }
  return false;
}

function detectVariableUsed(sections: BuilderSection[]): boolean {
  const variablePattern = /\{\{[^}]+\}\}/;
  for (const section of sections) {
    const content = section.content;
    // Check all string fields
    const stringValues = Object.values(content).filter((v): v is string => typeof v === "string");
    if (stringValues.some((v) => variablePattern.test(v))) return true;
    // Check column children
    if (content.columnChildren) {
      for (const col of content.columnChildren) {
        if (detectVariableUsed(col)) return true;
      }
    }
  }
  return false;
}

export default function BuilderChecklist({
  sections,
  hasPreviewedOnce,
  hasPublished,
  onFocusHeadline,
  onFocusVariables,
  onTriggerPreview,
  onTriggerPublish,
}: BuilderChecklistProps) {
  // Check if user has ever completed this before
  const [permanentlyDismissed, setPermanentlyDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const isFirstTimeUser = !permanentlyDismissed;

  const [expanded, setExpanded] = useState(isFirstTimeUser);
  const [dismissed, setDismissed] = useState(false);

  // Mark as permanently completed on publish
  useEffect(() => {
    if (hasPublished && !permanentlyDismissed) {
      localStorage.setItem(STORAGE_KEY, "true");
      setPermanentlyDismissed(true);
      // Auto-collapse after a short delay
      setTimeout(() => setExpanded(false), 1500);
    }
  }, [hasPublished, permanentlyDismissed]);

  const headlineChanged = useMemo(() => detectHeadlineChanged(sections), [sections]);
  const variableUsed = useMemo(() => detectVariableUsed(sections), [sections]);

  const items: ChecklistItem[] = [
    {
      id: "headline",
      label: "Replace your headline",
      completed: headlineChanged,
      onClick: onFocusHeadline,
    },
    {
      id: "variable",
      label: "Add at least one personalization variable",
      completed: variableUsed,
      onClick: onFocusVariables,
    },
    {
      id: "preview",
      label: "Preview your page",
      completed: hasPreviewedOnce,
      onClick: onTriggerPreview,
    },
    {
      id: "publish",
      label: "Publish",
      completed: hasPublished,
      onClick: onTriggerPublish,
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const allDone = completedCount === items.length;

  // Don't show for returning users or if dismissed
  if (permanentlyDismissed || dismissed) return null;
  // Don't show if no sections yet (user hasn't started building)
  if (sections.length === 0) return null;

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          Getting Started
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{items.length}
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="Dismiss checklist"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Checklist items */}
      {expanded && (
        <div className="px-4 py-3 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={item.completed}
              className="w-full flex items-start gap-2.5 py-2 px-1 rounded-md text-left transition-colors hover:bg-muted/50 disabled:hover:bg-transparent group"
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0 group-hover:text-muted-foreground" />
              )}
              <span
                className={`text-sm leading-snug ${
                  item.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* Completion message */}
          {allDone && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  You're ready to generate personalized links.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
