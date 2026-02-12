import { Braces, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomVariables } from "@/hooks/useCustomVariables";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const BuilderVariablesPanel = () => {
  const { allVariables, loading } = useCustomVariables();
  const { toast } = useToast();

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied!", description: token });
  };

  return (
    <div className="border-b border-border">
      <div className="p-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Braces className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Variables</span>
          <span className="text-[10px] text-muted-foreground">({allVariables.length})</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild>
          <Link to="/admin?tab=variables" target="_blank">
            <ExternalLink className="w-3 h-3 mr-1" />Manage
          </Link>
        </Button>
      </div>
      <div className="px-3 pb-3 space-y-0.5 max-h-36 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-muted-foreground py-2">Loading…</p>
        ) : (
          allVariables.map((v) => (
            <button
              key={v.id}
              className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-accent text-xs group"
              onClick={() => copyToken(v.token)}
              title={`Click to copy ${v.token}`}
            >
              <code className="text-primary font-mono text-[10px] truncate flex-1">{v.token}</code>
              <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderVariablesPanel;
