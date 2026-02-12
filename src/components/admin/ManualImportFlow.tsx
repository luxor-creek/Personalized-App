import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, ExternalLink, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, FileSpreadsheet, ChevronLeft, ChevronRight, Eye, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MappedRow {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  company?: string | null;
  custom_message?: string | null;
}

interface ManualImportFlowProps {
  onImport: (rows: MappedRow[]) => Promise<void>;
  templateSlug?: string | null;
  isBuilderTemplate?: boolean;
}

const TARGET_FIELDS = [
  { key: "email", label: "Email", required: true },
  { key: "first_name", label: "First Name", required: false },
  { key: "last_name", label: "Last Name", required: false },
  { key: "company", label: "Company", required: false },
  { key: "custom_message", label: "Custom Message", required: false },
];

type Source = null | "csv" | "gsheet";
type Step = "choose" | "upload" | "gsheet-url" | "mapping" | "preview";

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

const ManualImportFlow = ({ onImport, templateSlug, isBuilderTemplate }: ManualImportFlowProps) => {
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

  // Preview state
  const [previewIndex, setPreviewIndex] = useState(0);

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
    setPreviewIndex(0);
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

  // Build mapped rows from raw data
  const buildMappedRows = useCallback((): MappedRow[] => {
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

    return allRows
      .map((values) => {
        const email = emailIdx >= 0 ? values[emailIdx]?.trim() : null;
        if (!email) return null;

        let firstName = firstNameIdx >= 0 ? values[firstNameIdx]?.trim() || null : null;
        const lastName = lastNameIdx >= 0 ? values[lastNameIdx]?.trim() || null : null;

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
  }, [allRows, headers, mapping]);

  const mappedRows = useMemo(() => {
    if (step === "preview" || step === "mapping") return buildMappedRows();
    return [];
  }, [step, buildMappedRows]);

  // Find the first valid contact index (has email)
  const firstValidIndex = useMemo(() => {
    const idx = mappedRows.findIndex(r => r.email);
    return idx >= 0 ? idx : 0;
  }, [mappedRows]);

  // Warnings for missing fields
  const missingFieldWarnings = useMemo(() => {
    if (mappedRows.length === 0) return [];
    const warnings: { field: string; count: number }[] = [];
    const fields = [
      { key: "first_name", label: "first_name" },
      { key: "company", label: "company" },
      { key: "custom_message", label: "custom_message" },
    ];
    for (const f of fields) {
      if (mapping[f.key]) {
        const missing = mappedRows.filter(r => !(r as any)[f.key]?.trim()).length;
        if (missing > 0 && missing < mappedRows.length) {
          warnings.push({ field: f.label, count: missing });
        }
      }
    }
    return warnings;
  }, [mappedRows, mapping]);

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

  const goToPreview = () => {
    if (!mapping.email) {
      toast({ title: "Email mapping required", description: "Please map the Email column to continue.", variant: "destructive" });
      return;
    }
    const rows = buildMappedRows();
    if (rows.length === 0) {
      toast({ title: "No valid rows", description: "No rows with a valid email were found.", variant: "destructive" });
      return;
    }
    setPreviewIndex(firstValidIndex);
    setStep("preview");
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      if (mappedRows.length === 0) throw new Error("No valid rows found");
      await onImport(mappedRows);
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
            onClick={goToPreview}
            disabled={!mapping.email}
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Personalized Page
          </Button>
        </div>
      </div>
    );
  }

  // Step: Preview
  if (step === "preview") {
    const currentContact = mappedRows[previewIndex] || mappedRows[0];
    const previewContacts = mappedRows.slice(0, 10);
    const sourceLabel = source === "csv" ? `CSV row ${previewIndex + 2}` : `Sheet row ${previewIndex + 2}`;

    // Build preview URL with personalization query params
    const previewUrl = templateSlug
      ? (() => {
          const base = isBuilderTemplate
            ? `/builder-preview/${templateSlug}`
            : `/template-editor/${templateSlug}?preview=true`;
          const sep = base.includes("?") ? "&" : "?";
          const params = new URLSearchParams();
          if (currentContact.first_name) params.set("p_first_name", currentContact.first_name);
          if (currentContact.last_name) params.set("p_last_name", currentContact.last_name);
          if (currentContact.company) params.set("p_company", currentContact.company);
          return `${base}${sep}${params.toString()}`;
        })()
      : null;

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setStep("mapping")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h4 className="font-semibold text-foreground">Preview a Personalized Version</h4>
            <p className="text-sm text-muted-foreground">
              Here's how your page will look for one contact from your list.
            </p>
          </div>
        </div>

        {/* Contact Switcher */}
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Preview as:</Label>
          <Select
            value={previewIndex.toString()}
            onValueChange={(v) => setPreviewIndex(parseInt(v, 10))}
          >
            <SelectTrigger className="text-sm h-9 max-w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {previewContacts.map((contact, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {contact.first_name}{contact.last_name ? ` ${contact.last_name}` : ""} {contact.email ? `(${contact.email})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={previewIndex === 0}
              onClick={() => setPreviewIndex(i => Math.max(0, i - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={previewIndex >= previewContacts.length - 1}
              onClick={() => setPreviewIndex(i => Math.min(previewContacts.length - 1, i + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two-pane layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Left: Page Preview */}
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            {previewUrl ? (
              <iframe
                key={previewIndex}
                src={previewUrl}
                className="w-full border-0 pointer-events-none"
                style={{ height: '500px', transform: 'scale(0.6)', transformOrigin: 'top left', width: '166.67%' }}
                title="Personalized page preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No template linked to this campaign
              </div>
            )}
          </div>

          {/* Right: Contact Details */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Details</p>
              <div className="space-y-2 text-sm">
                {currentContact.first_name && (
                  <div>
                    <span className="text-muted-foreground">First Name:</span>{" "}
                    <span className="text-foreground font-medium">{currentContact.first_name}</span>
                  </div>
                )}
                {currentContact.last_name && (
                  <div>
                    <span className="text-muted-foreground">Last Name:</span>{" "}
                    <span className="text-foreground font-medium">{currentContact.last_name}</span>
                  </div>
                )}
                {currentContact.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="text-foreground font-medium">{currentContact.email}</span>
                  </div>
                )}
                {currentContact.company && (
                  <div>
                    <span className="text-muted-foreground">Company:</span>{" "}
                    <span className="text-foreground font-medium">{currentContact.company}</span>
                  </div>
                )}
                {currentContact.custom_message && (
                  <div>
                    <span className="text-muted-foreground">Custom Message:</span>{" "}
                    <span className="text-foreground font-medium">{currentContact.custom_message}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">{sourceLabel}</span>
              </div>
            </div>

            {/* Warnings */}
            {missingFieldWarnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Data
                </div>
                {missingFieldWarnings.map((w) => (
                  <p key={w.field} className="text-xs text-amber-600 dark:text-amber-500">
                    {w.count} contacts are missing: <strong>{w.field}</strong>. Fallbacks will be used where available.
                  </p>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {mappedRows.length} valid contacts total
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => setStep("mapping")}>
            Back to Mapping
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={importing}
            className="flex-1 gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {importing ? "Generating..." : `Continue to Generate (${mappedRows.length} contacts)`}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default ManualImportFlow;
