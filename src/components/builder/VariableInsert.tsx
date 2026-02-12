import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Braces, Globe, Lock } from "lucide-react";
import { useCustomVariables } from "@/hooks/useCustomVariables";

interface VariableInsertProps {
  onInsert: (token: string) => void;
}

const VariableInsert = ({ onInsert }: VariableInsertProps) => {
  const { allVariables } = useCustomVariables();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-1.5 text-muted-foreground" title="Insert variable">
          <Braces className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-72 overflow-y-auto">
        <DropdownMenuLabel className="text-xs">System Variables</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allVariables.filter((v) => v.isSystem).map((v) => (
          <DropdownMenuItem key={v.id} onClick={() => onInsert(v.token)} className="text-xs">
            <Lock className="w-3 h-3 mr-1.5 text-muted-foreground shrink-0" />
            <code className="text-primary mr-2 font-mono">{v.token}</code>
            <span className="text-muted-foreground">{v.name}</span>
          </DropdownMenuItem>
        ))}
        {allVariables.some((v) => !v.isSystem) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Custom Variables</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allVariables.filter((v) => !v.isSystem).map((v) => (
              <DropdownMenuItem key={v.id} onClick={() => onInsert(v.token)} className="text-xs">
                <Braces className="w-3 h-3 mr-1.5 text-primary shrink-0" />
                <code className="text-primary mr-2 font-mono">{v.token}</code>
                <span className="text-muted-foreground">{v.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VariableInsert;
