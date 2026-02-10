import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSubmission {
  id: string;
  template_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  primary_goal: string | null;
  product_url: string | null;
  extra_fields: Record<string, string> | null;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
}

const FormSubmissionsPanel = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) fetchSubmissions();
  }, [selectedTemplateId]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("landing_page_templates")
      .select("id, name")
      .order("name");
    setTemplates(data || []);
  };

  const fetchSubmissions = async () => {
    if (!selectedTemplateId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("template_id", selectedTemplateId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSubmissions((data as FormSubmission[]) || []);
    setLoading(false);
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    const { error } = await supabase.from("form_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const exportCsv = () => {
    if (submissions.length === 0) return;
    const headers = ["First Name", "Last Name", "Email", "Company", "Phone", "Address", "City", "State/Prov", "Zip/Postal", "Primary Goal", "Product URL", "Date"];
    const rows = submissions.map((s) => [
      s.first_name || "",
      s.last_name || "",
      s.email || "",
      s.company || "",
      s.phone || "",
      s.address || "",
      s.city || "",
      s.state || "",
      s.zip || "",
      s.primary_goal || "",
      s.product_url || "",
      new Date(s.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-submissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a landing page..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplateId && (
          <>
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {submissions.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto">{submissions.length} submissions</span>
          </>
        )}
      </div>

      {selectedTemplateId && submissions.length > 0 ? (
        <div className="border rounded-lg overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap">{[s.first_name, s.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                  <TableCell className="text-xs">{s.email || "—"}</TableCell>
                  <TableCell className="text-xs">{s.company || "—"}</TableCell>
                  <TableCell className="text-xs">{s.phone || "—"}</TableCell>
                  <TableCell className="text-xs">{s.city || "—"}</TableCell>
                  <TableCell className="text-xs">{s.state || "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => deleteSubmission(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : selectedTemplateId ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No submissions yet for this page.</p>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">Select a landing page to view form submissions.</p>
      )}
    </div>
  );
};

export default FormSubmissionsPanel;
