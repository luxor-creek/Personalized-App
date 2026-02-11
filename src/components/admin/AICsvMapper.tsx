import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Check, ArrowRight, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TARGET_FIELDS = [
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name", required: false },
  { key: "email", label: "Email", required: false },
  { key: "company", label: "Company", required: false },
  { key: "custom_message", label: "Custom Message", required: false },
];

interface AICsvMapperProps {
  onMappedUpload: (rows: Array<{
    first_name: string;
    last_name?: string | null;
    email?: string | null;
    company?: string | null;
    custom_message?: string | null;
  }>) => Promise<void>;
}

const AICsvMapper = ({ onMappedUpload }: AICsvMapperProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "mapping" | "confirm">("upload");
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confidence, setConfidence] = useState<string>("");
  const [splitName, setSplitName] = useState(false);

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    try {
      const text = await f.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: "Invalid CSV", description: "Need a header row and at least one data row", variant: "destructive" });
        return;
      }

      const hdrs = parseCsvLine(lines[0]);
      setHeaders(hdrs);

      const rows = lines.slice(1).map(parseCsvLine);
      setAllRows(rows);
      setSampleRows(rows.slice(0, 3));

      // Auto-detect with AI
      setAiLoading(true);
      setStep("mapping");

      try {
        const { data, error } = await supabase.functions.invoke("ai-map-csv", {
          body: { headers: hdrs, sampleRows: rows.slice(0, 3) },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (data?.mapping) {
          setMapping(data.mapping);
          setConfidence(data.confidence || "medium");
          setSplitName(data.transforms?.split_name || false);
        }
      } catch (err: any) {
        console.error("AI mapping failed, falling back to manual:", err);
        toast({ title: "AI couldn't auto-detect columns", description: "Please map them manually below." });
      } finally {
        setAiLoading(false);
      }
    } catch (err: any) {
      toast({ title: "Error reading file", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const handleUpload = async () => {
    if (!mapping.first_name) {
      toast({ title: "First Name mapping required", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const getMappedIndex = (field: string) => {
        const col = mapping[field];
        if (!col) return -1;
        return headers.indexOf(col);
      };

      const firstNameIdx = getMappedIndex("first_name");
      const lastNameIdx = getMappedIndex("last_name");
      const emailIdx = getMappedIndex("email");
      const companyIdx = getMappedIndex("company");
      const messageIdx = getMappedIndex("custom_message");

      const rows = allRows
        .map((values) => {
          let firstName = values[firstNameIdx]?.trim();
          let lastName = lastNameIdx >= 0 ? values[lastNameIdx]?.trim() || null : null;

          // Handle "Full Name" splitting
          if (splitName && firstName && !lastName) {
            const parts = firstName.split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(" ") || null;
          }

          if (!firstName) return null;

          return {
            first_name: firstName,
            last_name: lastName,
            email: emailIdx >= 0 ? values[emailIdx]?.trim() || null : null,
            company: companyIdx >= 0 ? values[companyIdx]?.trim() || null : null,
            custom_message: messageIdx >= 0 ? values[messageIdx]?.trim() || null : null,
          };
        })
        .filter(Boolean) as any[];

      if (rows.length === 0) {
        throw new Error("No valid rows found");
      }

      await onMappedUpload(rows);

      // Reset
      setFile(null);
      setHeaders([]);
      setAllRows([]);
      setSampleRows([]);
      setMapping({});
      setStep("upload");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (step === "upload") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload any CSV — AI will auto-detect your columns. No special formatting needed!
        </p>
        <Input type="file" accept=".csv" onChange={handleFileSelect} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aiLoading ? (
        <div className="flex items-center gap-3 py-6 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">AI is analyzing your columns...</span>
        </div>
      ) : (
        <>
          {confidence && (
            <div className={`text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
              confidence === "high" ? "bg-green-100 text-green-700" :
              confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              <Sparkles className="w-3 h-3" />
              AI confidence: {confidence}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Column Mapping</p>
            {TARGET_FIELDS.map(({ key, label, required }) => (
              <div key={key} className="flex items-center gap-3">
                <Label className="text-xs w-28 shrink-0">
                  {label} {required && <span className="text-destructive">*</span>}
                </Label>
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <Select
                  value={mapping[key] || "__none__"}
                  onValueChange={(v) => setMapping((prev) => {
                    if (v === "__none__") {
                      const { [key]: _, ...rest } = prev;
                      return rest;
                    }
                    return { ...prev, [key]: v };
                  })}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Skip —</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mapping[key] && <Check className="w-4 h-4 text-green-500 shrink-0" />}
              </div>
            ))}
          </div>

          {sampleRows.length > 0 && (
            <div className="border rounded-lg overflow-auto max-h-32">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-muted">
                    {headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.map((v, j) => (
                        <td key={j} className="px-2 py-1 whitespace-nowrap">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setStep("upload"); setFile(null); setHeaders([]); setMapping({}); }}>
              Back
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !mapping.first_name}
              className="flex-1 gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Creating pages..." : `Import ${allRows.length} contacts`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AICsvMapper;
