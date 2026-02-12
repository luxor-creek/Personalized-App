import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, ExternalLink, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, FileSpreadsheet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MappedRow {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  company?: string | null;
  custom_message?: string | null;
}

interface ManualImportFlowProps {
  onImport: (rows: MappedRow[]) => Promise<void>;
}

const TARGET_FIELDS = [
  { key: "email", label: "Email", required: true },
  { key: "first_name", label: "First Name", required: false },
  { key: "last_name", label: "Last Name", required: false },
  { key: "company", label: "Company", required: false },
  { key: "custom_message", label: "Custom Message", required: false },
];

type Source = null | "csv" | "gsheet";
type Step = "choose" | "upload" | "gsheet-url" | "mapping" | "confirm";

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

const ManualImportFlow = ({ onImport }: ManualImportFlowProps) => {
  const { toast } = useToast();
  const [source, setSource] = useState<Source>(null);
  const [step, setStep] = useState<Step>("choose");

  // CSV state
  const [file, setFile] = useState<File | null>(null);

  // Google Sheets state
  const [gsheetUrl, setGsheetUrl] = useState("");
  const [fetchingSheet, setFetchingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  // Shared parsing state
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);

  const resetAll = () => {
    setSource(null);
    setStep("choose");
    setFile(null);
    setGsheetUrl("");
    setSheetError(null);
    setHeaders([]);
    setAllRows([]);
    setSampleRows([]);
    setMapping({});
  };

  const processLines = (lines: string[]) => {
    if (lines.length < 2) {
      toast({ title: "Invalid data", description: "Need a header row and at least one data row", variant: "destructive" });
      return false;
    }
    const hdrs = parseCsvLine(lines[0]);
    setHeaders(hdrs);
    const rows = lines.slice(1).map(parseCsvLine);
    setAllRows(rows);
    setSampleRows(rows.slice(0, 5));

    // Auto-map by matching header names
    const autoMap: Record<string, string> = {};
    for (const field of TARGET_FIELDS) {
      const match = hdrs.find((h) => {
        const lower = h.toLowerCase().replace(/[_\s-]/g, "");
        if (field.key === "email") return lower === "email" || lower === "emailaddress";
        if (field.key === "first_name") return lower === "firstname" || lower === "first" || lower === "name";
        if (field.key === "last_name") return lower === "lastname" || lower === "last" || lower === "surname";
        if (field.key === "company") return lower === "company" || lower === "organization" || lower === "org";
        if (field.key === "custom_message") return lower === "custommessage" || lower === "message" || lower === "note";
        return false;
      });
      if (match) autoMap[field.key] = match;
    }
    setMapping(autoMap);
    return true;
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "CSV must be under 5MB", variant: "destructive" });
      return;
    }
    setFile(f);
    try {
      const text = await f.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (processLines(lines)) {
        setStep("mapping");
      }
    } catch (err: any) {
      toast({ title: "Error reading file", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const handleFetchSheet = async () => {
    if (!gsheetUrl.trim()) return;
    setFetchingSheet(true);
    setSheetError(null);
    try {
      const match = gsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) throw new Error("Invalid Google Sheets URL. Please paste a full Google Sheets link.");
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("We can't access this sheet. Please update sharing settings or use CSV.");
      const text = await res.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (processLines(lines)) {
        setStep("mapping");
      }
    } catch (err: any) {
      setSheetError(err.message);
    } finally {
      setFetchingSheet(false);
    }
  };

  const handleImport = async () => {
    if (!mapping.email) {
      toast({ title: "Email mapping required", description: "Please map the Email column to continue.", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      const getIdx = (field: string) => {
        const col = mapping[field];
        if (!col) return -1;
        return headers.indexOf(col);
      };

      const emailIdx = getIdx("email");
      const firstNameIdx = getIdx("first_name");
      const lastNameIdx = getIdx("last_name");
      const companyIdx = getIdx("company");
      const messageIdx = getIdx("custom_message");

      const rows: MappedRow[] = allRows
        .map((values) => {
          const email = emailIdx >= 0 ? values[emailIdx]?.trim() : null;
          if (!email) return null;

          let firstName = firstNameIdx >= 0 ? values[firstNameIdx]?.trim() || null : null;
          const lastName = lastNameIdx >= 0 ? values[lastNameIdx]?.trim() || null : null;

          // Fallback: if no first_name mapped, use part before @ from email
          if (!firstName && email) {
            firstName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          }

          return {
            first_name: firstName || "Contact",
            last_name: lastName,
            email,
            company: companyIdx >= 0 ? values[companyIdx]?.trim() || null : null,
            custom_message: messageIdx >= 0 ? values[messageIdx]?.trim() || null : null,
          };
        })
        .filter(Boolean) as MappedRow[];

      if (rows.length === 0) throw new Error("No valid rows found");

      await onImport(rows);
      resetAll();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  // Step: Choose source
  if (step === "choose") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => { setSource("csv"); setStep("upload"); }}
            className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Upload CSV</p>
              <p className="text-sm text-muted-foreground">Upload a .csv file with your contacts</p>
            </div>
          </button>
          <button
            onClick={() => { setSource("gsheet"); setStep("gsheet-url"); }}
            className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Import from Google Sheets</p>
              <p className="text-sm text-muted-foreground">Paste a public Google Sheets URL</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step: Upload CSV file
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetAll}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-semibold text-foreground">Upload your contact list</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a .csv file. We'll detect your columns automatically.
        </p>
        <Input type="file" accept=".csv" onChange={handleFileSelect} />
      </div>
    );
  }

  // Step: Google Sheet URL
  if (step === "gsheet-url") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetAll}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-semibold text-foreground">Import from Google Sheets</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Make sure link sharing is set to "Anyone with the link can view."
        </p>
        <Input
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={gsheetUrl}
          onChange={(e) => { setGsheetUrl(e.target.value); setSheetError(null); }}
        />
        {sheetError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{sheetError}</span>
          </div>
        )}
        <Button onClick={handleFetchSheet} disabled={!gsheetUrl.trim() || fetchingSheet}>
          {fetchingSheet ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching...</>
          ) : (
            <><ExternalLink className="w-4 h-4 mr-2" /> Fetch Sheet</>
          )}
        </Button>
      </div>
    );
  }

  // Step: Mapping
  if (step === "mapping") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            if (source === "csv") { setStep("upload"); setFile(null); }
            else { setStep("gsheet-url"); }
            setHeaders([]); setAllRows([]); setSampleRows([]); setMapping({});
          }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-semibold text-foreground">Map your columns</h4>
          <span className="text-sm text-muted-foreground ml-auto">
            {allRows.length} rows detected
          </span>
        </div>

        {/* Column mapping */}
        <div className="space-y-3">
          {TARGET_FIELDS.map(({ key, label, required }) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="text-sm w-32 shrink-0">
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
                <SelectTrigger className="text-sm h-9">
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

        {/* Preview table */}
        {sampleRows.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
            <div className="border rounded-lg overflow-auto max-h-40">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-muted">
                    {headers.map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.map((v, j) => (
                        <td key={j} className="px-2 py-1 whitespace-nowrap max-w-[200px] truncate">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleImport}
            disabled={importing || !mapping.email}
            className="flex-1 gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? "Importing..." : `Import ${allRows.length} contacts`}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default ManualImportFlow;
