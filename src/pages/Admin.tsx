import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { Plus, Upload, ExternalLink, Trash2, BarChart3, LogOut, Eye, Layout, Pencil, Shield, Send, Mail, Download, HelpCircle, Copy, Hammer, TrendingUp, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { Textarea } from "@/components/ui/textarea";
import type { User, Session } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  template_id: string | null;
  created_at: string;
  page_count?: number;
  view_count?: number;
}

interface LandingPageTemplate {
  id: string;
  name: string;
  slug: string;
  thumbnail_url?: string | null;
  user_id?: string | null;
  is_builder_template?: boolean;
}

interface PersonalizedPage {
  id: string;
  token: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  custom_message: string | null;
  created_at: string;
  view_count?: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [pages, setPages] = useState<PersonalizedPage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create campaign dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  
  // CSV upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Add person dialog
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    first_name: "",
    last_name: "",
    company: "",
    custom_message: "",
  });
  const [addingPerson, setAddingPerson] = useState(false);

  // Edit contact dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PersonalizedPage | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", company: "", email: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // Test email dialog
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);

  // Beta Questions state
  const [infoRequests, setInfoRequests] = useState<Array<{ id: string; first_name: string; email: string; created_at: string }>>([]);
  const [infoRequestCount, setInfoRequestCount] = useState(0);
  const [sendingBetaEmail, setSendingBetaEmail] = useState(false);
  const [betaEmailDialogOpen, setBetaEmailDialogOpen] = useState(false);
  const [betaEmailTarget, setBetaEmailTarget] = useState<{ id: string; first_name: string; email: string } | null>(null);
  const [betaEmailSubject, setBetaEmailSubject] = useState("");
  const [betaEmailBody, setBetaEmailBody] = useState("");

  // View details modal state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewDetailsLoading, setViewDetailsLoading] = useState(false);
  const [viewDetailsData, setViewDetailsData] = useState<Array<{ id: string; viewed_at: string; user_agent: string | null }>>([]);
  const [viewDetailsContact, setViewDetailsContact] = useState<{ name: string; view_count: number } | null>(null);

  // Snov.io integration state
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [workflowCardsExpanded, setWorkflowCardsExpanded] = useState(true);
  const [snovGuideOpen, setSnovGuideOpen] = useState(false);

  const [snovDialogOpen, setSnovDialogOpen] = useState(false);
  const [snovLists, setSnovLists] = useState<Array<{ id: number; name: string; contacts: number }>>([]);
  const [loadingSnovLists, setLoadingSnovLists] = useState(false);
  const [selectedSnovList, setSelectedSnovList] = useState<number | null>(null);
  const [selectedSnovCampaignList, setSelectedSnovCampaignList] = useState<number | null>(null);
  const [snovEmailConfig, setSnovEmailConfig] = useState({
    subject: "{{first_name}}, check out your personalized video",
    body: "Hi {{first_name}},\n\nI created a personalized video just for you. Check it out here:\n\n{{country}}\n\nLet me know what you think!\n\nBest regards",
    fromEmail: "",
    fromName: "",
  });
  const [sendingSnov, setSendingSnov] = useState(false);

  // Snov.io stats state
  const [snovStatsDialogOpen, setSnovStatsDialogOpen] = useState(false);
  const [snovCampaigns, setSnovCampaigns] = useState<Array<{ id: number; name: string; listId: number; status: string; createdAt: string | null; startedAt: string | null }>>([]);
  const [loadingSnovCampaigns, setLoadingSnovCampaigns] = useState(false);
  const [selectedSnovCampaignForStats, setSelectedSnovCampaignForStats] = useState<number | null>(null);
  const [snovStats, setSnovStats] = useState<{ analytics: any; replies: any; opens: any; clicks: any } | null>(null);
  const [loadingSnovStats, setLoadingSnovStats] = useState(false);

  // Check authentication and admin role
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          setCheckingAuth(false);
          navigate("/auth");
          return;
        }
        
        // Check admin role using setTimeout to avoid deadlock
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        setCheckingAuth(false);
        navigate("/auth");
        return;
      }
      
      checkAdminRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If no role found, user is not admin
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchCampaigns();
      fetchTemplates();
      fetchInfoRequests();
    }
  }, [user, isAdmin]);

  const fetchInfoRequests = async () => {
    try {
      const { data, error, count } = await supabase
        .from("info_requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInfoRequests(data || []);
      setInfoRequestCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching info requests:", error.message);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_page_templates")
        .select("id, name, slug, thumbnail_url, user_id, is_builder_template")
        .order("name");

      if (error) throw error;
      setTemplates((data as LandingPageTemplate[]) || []);
      
      // Set default template if none selected
      if (!selectedTemplateId && data && data.length > 0) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching templates:", error.message);
    }
  };

  useEffect(() => {
    if (selectedCampaign) {
      fetchPages(selectedCampaign.id);
      setWorkflowCardsExpanded(true); // Reset when switching campaigns
    }
  }, [selectedCampaign]);

  // Auto-collapse workflow cards once pages are loaded
  useEffect(() => {
    if (pages.length > 0) {
      setWorkflowCardsExpanded(false);
    }
  }, [pages.length > 0]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get page counts and view counts for each campaign
      const campaignsWithStats = await Promise.all(
        (data || []).map(async (campaign) => {
          const { count: pageCount } = await supabase
            .from("personalized_pages")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          const { data: viewData } = await supabase
            .from("page_views")
            .select("personalized_pages!inner(campaign_id)")
            .eq("personalized_pages.campaign_id", campaign.id);

          return {
            ...campaign,
            page_count: pageCount || 0,
            view_count: viewData?.length || 0,
          };
        })
      );

      setCampaigns(campaignsWithStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from("personalized_pages")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get view counts for each page
      const pagesWithViews = await Promise.all(
        (data || []).map(async (page) => {
          const { count } = await supabase
            .from("page_views")
            .select("*", { count: "exact", head: true })
            .eq("personalized_page_id", page.id);

          return {
            ...page,
            view_count: count || 0,
          };
        })
      );

      setPages(pagesWithViews);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchViewDetails = async (page: PersonalizedPage) => {
    setViewDetailsContact({ name: `${page.first_name} ${page.last_name || ""}`.trim(), view_count: page.view_count || 0 });
    setViewDetailsOpen(true);
    setViewDetailsLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_views")
        .select("id, viewed_at, user_agent")
        .eq("personalized_page_id", page.id)
        .order("viewed_at", { ascending: false });

      if (error) throw error;
      setViewDetailsData(data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setViewDetailsLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim() || !user || !selectedTemplateId) return;

    try {
      const { error } = await supabase.from("campaigns").insert({
        name: newCampaignName.trim(),
        user_id: user.id,
        template_id: selectedTemplateId,
      });

      if (error) throw error;

      toast({ title: "Campaign created!" });
      setNewCampaignName("");
      setCreateDialogOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure? This will delete all personalized pages in this campaign.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      toast({ title: "Campaign deleted" });
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(null);
        setPages([]);
      }
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Sanitize CSV values to prevent formula injection (CSV injection attack)
  const sanitizeCsvValue = (value: string | undefined | null): string | null => {
    if (!value) return null;
    const trimmed = value.trim().replace(/^"|"$/g, "");
    if (!trimmed) return null;
    
    // Prefix formula characters with single quote to prevent execution in spreadsheets
    const formulaChars = ["=", "+", "-", "@", "\t", "\r"];
    if (formulaChars.some(char => trimmed.startsWith(char))) {
      return "'" + trimmed;
    }
    return trimmed;
  };

  // Enforce field length limits for CSV uploads
  const MAX_CSV_LENGTHS = {
    first_name: 100,
    last_name: 100,
    company: 100,
    custom_message: 500,
  };

  const truncateField = (value: string | null, maxLength: number): string | null => {
    if (!value) return null;
    return value.slice(0, maxLength);
  };

  // Maximum CSV file size (5MB)
  const MAX_CSV_SIZE = 5 * 1024 * 1024;

  const handleCsvUpload = async () => {
    if (!csvFile || !selectedCampaign) return;

    // Validate file size
    if (csvFile.size > MAX_CSV_SIZE) {
      toast({
        title: "File too large",
        description: "CSV file must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV must have a header row and at least one data row");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      
      // Validate required headers
      const firstNameIndex = headers.findIndex((h) => 
        h === "first_name" || h === "firstname" || h === "first name"
      );
      
      if (firstNameIndex === -1) {
        throw new Error("CSV must have a 'first_name' column");
      }

      const lastNameIndex = headers.findIndex((h) => 
        h === "last_name" || h === "lastname" || h === "last name"
      );
      const companyIndex = headers.findIndex((h) => 
        h === "company" || h === "organization"
      );
      const messageIndex = headers.findIndex((h) => 
        h === "custom_message" || h === "message" || h === "custom message"
      );
      const emailIndex = headers.findIndex((h) => 
        h === "email" || h === "email_address" || h === "email address"
      );

      const pagesToCreate = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => sanitizeCsvValue(v));
        
        const firstName = truncateField(values[firstNameIndex], MAX_CSV_LENGTHS.first_name);
        if (!firstName) continue;

        pagesToCreate.push({
          campaign_id: selectedCampaign.id,
          template_id: selectedCampaign.template_id,
          first_name: firstName,
          last_name: truncateField(lastNameIndex >= 0 ? values[lastNameIndex] : null, MAX_CSV_LENGTHS.last_name),
          company: truncateField(companyIndex >= 0 ? values[companyIndex] : null, MAX_CSV_LENGTHS.company),
          custom_message: truncateField(messageIndex >= 0 ? values[messageIndex] : null, MAX_CSV_LENGTHS.custom_message),
          email: truncateField(emailIndex >= 0 ? values[emailIndex] : null, 255),
        });
      }

      if (pagesToCreate.length === 0) {
        throw new Error("No valid rows found in CSV");
      }

      const { error } = await supabase
        .from("personalized_pages")
        .insert(pagesToCreate);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Created ${pagesToCreate.length} personalized pages`,
      });
      
      setCsvFile(null);
      setUploadDialogOpen(false);
      fetchPages(selectedCampaign.id);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addSinglePerson = async () => {
    if (!newPerson.first_name.trim() || !selectedCampaign) return;

    setAddingPerson(true);
    try {
      const { data, error } = await supabase
        .from("personalized_pages")
        .insert({
          campaign_id: selectedCampaign.id,
          template_id: selectedCampaign.template_id,
          first_name: newPerson.first_name.trim(),
          last_name: newPerson.last_name.trim() || null,
          company: newPerson.company.trim() || null,
          custom_message: newPerson.custom_message.trim() || null,
        })
        .select("token")
        .single();

      if (error) throw error;

      const pageUrl = `${window.location.origin}/view/${data.token}`;
      
      toast({
        title: "Page created!",
        description: "Link copied to clipboard",
      });
      
      navigator.clipboard.writeText(pageUrl);
      
      setNewPerson({ first_name: "", last_name: "", company: "", custom_message: "" });
      setAddPersonDialogOpen(false);
      fetchPages(selectedCampaign.id);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingPerson(false);
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from("personalized_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;

      toast({ title: "Page deleted" });
      if (selectedCampaign) {
        fetchPages(selectedCampaign.id);
        fetchCampaigns();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPageUrl = (token: string) => {
    return `${window.location.origin}/view/${token}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const openEditDialog = (page: PersonalizedPage) => {
    setEditingPage(page);
    setEditForm({
      first_name: page.first_name,
      last_name: page.last_name || "",
      company: page.company || "",
      email: (page as any).email || "",
    });
    setEditDialogOpen(true);
  };

  const saveEditContact = async () => {
    if (!editingPage || !editForm.first_name.trim()) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("personalized_pages")
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim() || null,
          company: editForm.company.trim() || null,
          email: editForm.email.trim() || null,
        })
        .eq("id", editingPage.id);
      if (error) throw error;
      toast({ title: "Contact updated!" });
      setEditDialogOpen(false);
      setEditingPage(null);
      if (selectedCampaign) fetchPages(selectedCampaign.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const openTestEmail = () => {
    setTestEmailDialogOpen(true);
  };

  const handleSendTestEmail = () => {
    if (pages.length === 0 || !user) return;
    const firstContact = pages[0];
    const pageLink = getPageUrl(firstContact.token);
    const subject = encodeURIComponent(`Test: Personalized page for ${firstContact.first_name}${firstContact.company ? ` at ${firstContact.company}` : ""}`);
    const body = encodeURIComponent(
      `Hi ${firstContact.first_name},\n\nI created a personalized video just for you. Check it out here:\n\n${pageLink}\n\nLet me know what you think!\n\nBest regards`
    );
    const mailto = `mailto:${user.email}?subject=${subject}&body=${body}`;
    window.open(mailto, "_blank");
    setTestEmailDialogOpen(false);
  };

  const handleDownloadCsv = () => {
    if (!selectedCampaign || pages.length === 0) return;
    
    // CSV header
    const headers = ["First Name", "Last Name", "Company", "Email", "Link"];
    
    // Build CSV rows
    const rows = pages.map((page) => {
      const escapeCsvValue = (value: string | null | undefined): string => {
        if (!value) return "";
        // Escape double quotes by doubling them, wrap in quotes if contains comma, newline, or quote
        const escaped = value.replace(/"/g, '""');
        if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
          return `"${escaped}"`;
        }
        return escaped;
      };
      
      return [
        escapeCsvValue(page.first_name),
        escapeCsvValue(page.last_name),
        escapeCsvValue(page.company),
        escapeCsvValue((page as any).email),
        getPageUrl(page.token),
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedCampaign.name.replace(/[^a-z0-9]/gi, "_")}_contacts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "CSV downloaded!" });
  };

  // Snov.io functions
  const fetchSnovLists = async () => {
    setLoadingSnovLists(true);
    try {
      const { data, error } = await supabase.functions.invoke("snov-get-lists");
      
      if (error) throw error;
      
      if (data.success && data.lists) {
        setSnovLists(data.lists);
      } else {
        throw new Error(data.error || "Failed to fetch Snov.io lists");
      }
    } catch (error: any) {
      toast({
        title: "Error fetching Snov.io lists",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSnovLists(false);
    }
  };

  const sendSnovCampaign = async () => {
    if (!selectedSnovList || !selectedSnovCampaignList || !selectedCampaign) {
      toast({
        title: "Missing selection",
        description: "Please select both source list and target drip campaign list",
        variant: "destructive",
      });
      return;
    }

    setSendingSnov(true);
    try {
      const { data, error } = await supabase.functions.invoke("snov-send-campaign", {
        body: {
          listId: selectedSnovList,
          campaignId: selectedCampaign.id,
          snovCampaignListId: selectedSnovCampaignList,
          templateId: selectedCampaign.template_id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Campaign sent!",
          description: `Added ${data.added} prospects to Snov.io drip campaign. ${data.errors > 0 ? `${data.errors} errors.` : ""}`,
        });
        setSnovDialogOpen(false);
        fetchCampaigns();
        if (selectedCampaign) {
          fetchPages(selectedCampaign.id);
        }
      } else {
        throw new Error(data.error || "Failed to send campaign");
      }
    } catch (error: any) {
      toast({
        title: "Error sending campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingSnov(false);
    }
  };

  const openSnovDialog = () => {
    setSnovDialogOpen(true);
    fetchSnovLists();
  };

  const fetchSnovCampaigns = async () => {
    setLoadingSnovCampaigns(true);
    try {
      const { data, error } = await supabase.functions.invoke("snov-get-campaigns");
      if (error) throw error;
      if (data.success && data.campaigns) {
        setSnovCampaigns(data.campaigns);
      } else {
        throw new Error(data.error || "Failed to fetch campaigns");
      }
    } catch (error: any) {
      toast({ title: "Error fetching Snov.io campaigns", description: error.message, variant: "destructive" });
    } finally {
      setLoadingSnovCampaigns(false);
    }
  };

  const fetchSnovCampaignStats = async (snovCampaignId: number) => {
    setLoadingSnovStats(true);
    setSnovStats(null);
    setSelectedSnovCampaignForStats(snovCampaignId);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/snov-get-campaign-stats?snovCampaignId=${snovCampaignId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch stats");
      }
      setSnovStats({
        analytics: result.analytics,
        replies: result.replies,
        opens: result.opens,
        clicks: result.clicks,
      });
    } catch (error: any) {
      toast({ title: "Error fetching stats", description: error.message, variant: "destructive" });
    } finally {
      setLoadingSnovStats(false);
    }
  };

  const openSnovStatsDialog = () => {
    setSnovStatsDialogOpen(true);
    setSnovStats(null);
    setSelectedSnovCampaignForStats(null);
    fetchSnovCampaigns();
  };

  const duplicateTemplate = async (templateSlug: string) => {
    if (!user) return;
    setDuplicating(templateSlug);
    try {
      const { data: source, error: fetchErr } = await supabase
        .from("landing_page_templates")
        .select("*")
        .eq("slug", templateSlug)
        .single();
      if (fetchErr || !source) throw fetchErr || new Error("Template not found");

      const timestamp = Date.now().toString(36);
      const newSlug = `${source.slug}-copy-${timestamp}`;
      const newName = `${source.name} (Copy)`;

      const { id, slug, name, created_at, updated_at, user_id: _uid, ...rest } = source;
      const { error: insertErr } = await supabase
        .from("landing_page_templates")
        .insert({ ...rest, slug: newSlug, name: newName, user_id: user.id } as any);
      if (insertErr) throw insertErr;

      toast({ title: "Template cloned!", description: `"${newName}" added to My Templates.` });
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error duplicating", description: err.message, variant: "destructive" });
    } finally {
      setDuplicating(null);
    }
  };

  const deleteTemplate = async (templateSlug: string, templateName: string) => {
    if (!confirm(`Delete "${templateName}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from("landing_page_templates")
        .delete()
        .eq("slug", templateSlug);
      if (error) throw error;
      toast({ title: "Template deleted" });
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges to access this page.
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
            <Button onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogo className="h-8" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="landing-pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="landing-pages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layout className="w-4 h-4 mr-2" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Campaigns</TabsTrigger>
            <TabsTrigger value="beta-questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HelpCircle className="w-4 h-4 mr-2" />
              Beta Questions {infoRequestCount > 0 && <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">{infoRequestCount}</span>}
            </TabsTrigger>
          </TabsList>

          {/* Landing Pages Tab */}
          <TabsContent value="landing-pages" className="space-y-6">
            {/* My Templates - user-owned clones */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">My Templates</h2>
              <p className="text-muted-foreground mb-6">
                Templates you've cloned and customized for your campaigns.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Build from scratch card */}
                <Link to="/builder" className="group bg-card rounded-xl border border-dashed border-primary/30 overflow-hidden hover:border-primary transition-all hover:shadow-lg">
                  <div className="aspect-video bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <div className="text-center p-4">
                      <Hammer className="w-12 h-12 text-primary/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-primary">Build from Scratch</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">Page Builder</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a custom page with the visual builder.
                    </p>
                    <Button size="sm" className="w-full">
                      <Hammer className="w-4 h-4 mr-2" />
                      Start Building
                    </Button>
                  </div>
                </Link>
                {templates
                  .filter((t) => t.user_id === user?.id)
                  .map((t) => (
                    <div key={t.id} className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {t.thumbnail_url ? (
                          <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layout className="w-12 h-12 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-block px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded">
                            My Template
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mb-4 font-mono">{t.slug}</p>
                        <div className="flex gap-2">
                          <Link to={t.is_builder_template ? `/builder/${t.slug}` : `/template-editor/${t.slug}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateTemplate(t.slug)}
                            disabled={duplicating === t.slug}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(t.slug, t.name)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {templates.filter((t) => t.user_id === user?.id).length === 0 && (
                  <div className="bg-card rounded-xl border border-dashed border-border overflow-hidden">
                    <div className="aspect-video bg-muted/30 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Copy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No templates yet</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-muted-foreground mb-1">Get Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse the Template Library below and click "Use Template" to clone one.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Library - shared templates (user_id IS NULL) */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">Template Library</h2>
              <p className="text-muted-foreground mb-6">
                Browse pre-built templates. Click "Use Template" to clone one into your account and customize it.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates
                  .filter((t) => !t.user_id)
                  .map((t) => (
                    <div key={t.id} className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {t.thumbnail_url ? (
                          <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layout className="w-12 h-12 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">
                            Library
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Pre-built template ready to customize.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => duplicateTemplate(t.slug)}
                            disabled={duplicating === t.slug}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {duplicating === t.slug ? "Cloning..." : "Use Template"}
                          </Button>
                          {isAdmin && (
                            <Link to={`/template-editor/${t.slug}`}>
                              <Button variant="outline" size="sm" title="Admin: Edit library template">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {templates.filter((t) => !t.user_id).length === 0 && (
                  <p className="text-muted-foreground col-span-3">No library templates available.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Campaigns</h2>
                <p className="text-muted-foreground">
                  Create personalized landing pages for your prospects
                </p>
              </div>

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Name your campaign to organize personalized pages.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        placeholder="e.g., Q1 Outreach"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-select">Landing Page Template *</Label>
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="Select a landing page" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        This template will be used for all personalized pages in this campaign.
                      </p>
                    </div>
                    <Button onClick={createCampaign} className="w-full" disabled={!selectedTemplateId}>
                      Create Campaign
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to start generating personalized pages.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campaign List */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCampaign?.id === campaign.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{campaign.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                            <span>{campaign.page_count} pages</span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {campaign.view_count} views
                            </span>
                            <span className="text-xs">
                              {new Date(campaign.created_at).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCampaign(campaign.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Campaign Details - Full Width */}
                {selectedCampaign ? (
                  <div className="space-y-6">
                    {/* Campaign Header */}
                    <div className="bg-card rounded-lg border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        {selectedCampaign.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {pages.length > 0 && (
                          <>
                            <Button variant="outline" size="sm" onClick={openTestEmail}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Test Email
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                              <Download className="w-4 h-4 mr-2" />
                              Download CSV
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={openSnovStatsDialog}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Snov.io Stats
                        </Button>
                        {/* Snov.io Campaign Stats Dialog */}
                        <Dialog open={snovStatsDialogOpen} onOpenChange={setSnovStatsDialogOpen}>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Snov.io Campaign Stats</DialogTitle>
                              <DialogDescription>
                                View email engagement analytics from your Snov.io campaigns.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {loadingSnovCampaigns ? (
                                <div className="flex items-center justify-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                              ) : snovCampaigns.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No Snov.io campaigns found.</p>
                              ) : (
                                <>
                                  <div className="space-y-2">
                                    <Label>Select a Snov.io Campaign</Label>
                                    <Select
                                      value={selectedSnovCampaignForStats?.toString() || ""}
                                      onValueChange={(val) => fetchSnovCampaignStats(parseInt(val, 10))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose a campaign..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {snovCampaigns.map((c) => (
                                          <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name} ({c.status})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {loadingSnovStats && (
                                    <div className="flex items-center justify-center py-8">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                  )}

                                  {snovStats && !loadingSnovStats && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {(() => {
                                          const a = snovStats.analytics;
                                          const stats = Array.isArray(a) ? a[0] : a;
                                          return (
                                            <>
                                              <div className="bg-muted rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">{stats?.sent || stats?.emails_sent || 0}</p>
                                                <p className="text-xs text-muted-foreground">Sent</p>
                                              </div>
                                              <div className="bg-muted rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">{stats?.opened || stats?.opens || 0}</p>
                                                <p className="text-xs text-muted-foreground">Opens</p>
                                              </div>
                                              <div className="bg-muted rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">{stats?.replied || stats?.replies || 0}</p>
                                                <p className="text-xs text-muted-foreground">Replies</p>
                                              </div>
                                              <div className="bg-muted rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">{stats?.clicked || stats?.clicks || 0}</p>
                                                <p className="text-xs text-muted-foreground">Clicks</p>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>

                                      {snovStats.replies && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-foreground mb-2">Recent Replies</h4>
                                          {(() => {
                                            const replyList = snovStats.replies?.replies || snovStats.replies?.data || [];
                                            if (!Array.isArray(replyList) || replyList.length === 0) {
                                              return <p className="text-sm text-muted-foreground">No replies yet.</p>;
                                            }
                                            return (
                                              <div className="max-h-40 overflow-y-auto space-y-2">
                                                {replyList.slice(0, 10).map((r: any, i: number) => (
                                                  <div key={i} className="bg-muted rounded-lg p-3 text-sm">
                                                    <p className="font-medium text-foreground">{r.email || r.prospect_email || "Unknown"}</p>
                                                    {r.replied_at && <p className="text-xs text-muted-foreground">{new Date(r.replied_at).toLocaleString()}</p>}
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      )}

                                      {snovStats.opens && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-foreground mb-2">Recent Opens</h4>
                                          {(() => {
                                            const openList = snovStats.opens?.recipients || snovStats.opens?.data || [];
                                            if (!Array.isArray(openList) || openList.length === 0) {
                                              return <p className="text-sm text-muted-foreground">No opens tracked.</p>;
                                            }
                                            return (
                                              <div className="max-h-40 overflow-y-auto space-y-1">
                                                {openList.slice(0, 10).map((o: any, i: number) => (
                                                  <div key={i} className="flex justify-between items-center bg-muted rounded px-3 py-2 text-sm">
                                                    <span className="text-foreground">{o.email || o.prospect_email || "Unknown"}</span>
                                                    <span className="text-muted-foreground text-xs">{o.opens_count || o.count || 1}x</span>
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Next Steps Status Banner - shown when pages exist */}
                    {pages.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {pages.length} personalized page{pages.length !== 1 ? "s" : ""} ready
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Your contacts have personalized landing pages. Go to Snov.io to start or monitor your drip campaign — the <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{{landing_page}}"}</code> links are already synced.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={openSnovStatsDialog}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Stats
                          </Button>
                          <Button size="sm" onClick={() => setSnovGuideOpen(true)}>
                            Open Snov.io
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Workflow Cards */}
                    <div>
                      <button
                        onClick={() => setWorkflowCardsExpanded(!workflowCardsExpanded)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                      >
                        {workflowCardsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {pages.length > 0 ? "Add more contacts" : "Choose how to add contacts"}
                      </button>

                      {workflowCardsExpanded && (
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Primary: Snov.io Integration Card */}
                          <div className="bg-card rounded-xl border-2 border-primary/30 p-6 space-y-4 relative">
                            <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded">Recommended</span>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Send className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">Send via Snov.io</h4>
                                <p className="text-sm text-muted-foreground">Auto-generate personalized pages</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Pull contacts from your Snov.io list, generate personalized landing pages for each, and sync them to your drip campaign automatically.
                            </p>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                              <li>Select your source contact list</li>
                              <li>Select your drip campaign list</li>
                              <li>We generate pages & sync the <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{{landing_page}}"}</code> link</li>
                            </ol>
                            <Dialog open={snovDialogOpen} onOpenChange={setSnovDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="w-full" onClick={openSnovDialog}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Connect Snov.io List
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Send Campaign via Snov.io</DialogTitle>
                                  <DialogDescription>
                                    Import contacts from a Snov.io list and add them to a drip campaign.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  {loadingSnovLists ? (
                                    <div className="flex items-center justify-center py-4">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                  ) : snovLists.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No lists found. Create a list in Snov.io first.</p>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        <Label>Source List (get contacts from)</Label>
                                        <div className="grid gap-2 max-h-32 overflow-y-auto">
                                          {snovLists.map((list) => (
                                            <div
                                              key={list.id}
                                              onClick={() => setSelectedSnovList(list.id)}
                                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedSnovList === list.id
                                                  ? "border-primary bg-primary/10"
                                                  : "border-border hover:border-primary/50"
                                              }`}
                                            >
                                              <div className="flex justify-between items-center">
                                                <span className="font-medium">{list.name}</span>
                                                <span className="text-sm text-muted-foreground">{list.contacts} contacts</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Target List (with drip campaign attached)</Label>
                                        <p className="text-xs text-muted-foreground">
                                          This list should have a drip campaign configured in Snov.io. Use {"{{landing_page}}"} in your email template for the landing page URL.
                                        </p>
                                        <div className="grid gap-2 max-h-32 overflow-y-auto">
                                          {snovLists.map((list) => (
                                            <div
                                              key={list.id}
                                              onClick={() => setSelectedSnovCampaignList(list.id)}
                                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedSnovCampaignList === list.id
                                                  ? "border-primary bg-primary/10"
                                                  : "border-border hover:border-primary/50"
                                              }`}
                                            >
                                              <div className="flex justify-between items-center">
                                                <span className="font-medium">{list.name}</span>
                                                <span className="text-sm text-muted-foreground">{list.contacts} contacts</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  <Button 
                                    onClick={sendSnovCampaign} 
                                    className="w-full" 
                                    disabled={!selectedSnovList || !selectedSnovCampaignList || sendingSnov}
                                  >
                                    {sendingSnov ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Add to Drip Campaign
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Secondary: CSV / Manual Card */}
                          <div className="bg-card rounded-xl border border-dashed border-border p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">Or: Upload CSV / Add Manually</h4>
                                <p className="text-sm text-muted-foreground">For use with any email platform</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Upload a CSV or add contacts one-by-one. We'll generate personalized landing pages you can download and use with any email tool.
                            </p>
                            <div className="flex gap-2">
                              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload CSV
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Upload CSV</DialogTitle>
                                    <DialogDescription>
                                      Upload a CSV file with columns: first_name (required), last_name, company, email, custom_message
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <Input
                                      type="file"
                                      accept=".csv"
                                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                    />
                                    <Button
                                      onClick={handleCsvUpload}
                                      disabled={!csvFile || uploading}
                                      className="w-full"
                                    >
                                      {uploading ? "Uploading..." : "Upload & Create Pages"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Person
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Person</DialogTitle>
                                    <DialogDescription>
                                      Create a personalized page for a single person.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="first-name">First Name *</Label>
                                        <Input
                                          id="first-name"
                                          value={newPerson.first_name}
                                          onChange={(e) => setNewPerson({ ...newPerson, first_name: e.target.value })}
                                          placeholder="John"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input
                                          id="last-name"
                                          value={newPerson.last_name}
                                          onChange={(e) => setNewPerson({ ...newPerson, last_name: e.target.value })}
                                          placeholder="Doe"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="company">Company</Label>
                                      <Input
                                        id="company"
                                        value={newPerson.company}
                                        onChange={(e) => setNewPerson({ ...newPerson, company: e.target.value })}
                                        placeholder="Acme Inc."
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="custom-message">Custom Message</Label>
                                      <Textarea
                                        id="custom-message"
                                        value={newPerson.custom_message}
                                        onChange={(e) => setNewPerson({ ...newPerson, custom_message: e.target.value })}
                                        placeholder="Optional personalized message..."
                                        rows={3}
                                      />
                                    </div>
                                    <Button onClick={addSinglePerson} className="w-full" disabled={addingPerson}>
                                      {addingPerson ? "Creating..." : "Create Page & Copy Link"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contacts Table - Full Width */}
                    {pages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
                        <p>No personalized pages yet.</p>
                        <p className="text-sm">Connect your Snov.io list above to get started, or upload a CSV.</p>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg border border-border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>First Name</TableHead>
                              <TableHead>Last Name</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Landing Page</TableHead>
                              <TableHead>Views</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pages.map((page) => (
                              <TableRow key={page.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditDialog(page)}>
                                <TableCell>{page.first_name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {page.last_name || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {page.company || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {(page as any).email || "-"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary"
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(getPageUrl(page.token)); }}
                                  >
                                    Copy Link
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto gap-1 text-foreground hover:text-primary"
                                    onClick={(e) => { e.stopPropagation(); fetchViewDetails(page); }}
                                  >
                                    <Eye className="w-3 h-3" />
                                    {page.view_count}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => { e.stopPropagation(); openEditDialog(page); }}
                                    >
                                      <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                                    >
                                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-6 text-center text-muted-foreground">
                    <p>Select a campaign to view details</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Beta Questions Tab */}
          <TabsContent value="beta-questions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Beta Questions</h2>
              <p className="text-muted-foreground">
                People who expressed interest via the beta signup form.
              </p>
            </div>

            {infoRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No signups yet.</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {infoRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.first_name}</TableCell>
                        <TableCell>{req.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(req.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBetaEmailTarget({ id: req.id, first_name: req.first_name, email: req.email });
                              setBetaEmailSubject("Personalized page info");
                              setBetaEmailBody(`Hi ${req.first_name},\n\nThanks for signing up to learn more about Personalized Pages. The platform is currently in Beta but will be released soon at discounted pricing.\n\nHow it works\n\n1. Log in and select a landing page template\n2. Upload your email list\n3. We generate a personalized landing page for every contact\n4. Send your campaign using your existing sales or automation platform\n\nThat's it. No custom builds. No one-off pages. Just fast, scalable personalization.\n\nI will send you an email once the platform is publicly available soon.\n\nTake care,\nPaul\n\nPersonalized.Pages`);
                              setBetaEmailDialogOpen(true);
                            }}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            Send Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Contact Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update the contact details. Landing page link cannot be changed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <Button onClick={saveEditContact} className="w-full" disabled={savingEdit || !editForm.first_name.trim()}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Preview the email content for the first contact, sent to your account email.</DialogDescription>
          </DialogHeader>
          {pages.length > 0 && user && (
            <div className="space-y-4 pt-4">
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-medium text-foreground">To:</span> <span className="text-muted-foreground">{user.email}</span></p>
                <p><span className="font-medium text-foreground">Contact Name:</span> <span className="text-muted-foreground">{pages[0].first_name}{pages[0].last_name ? ` ${pages[0].last_name}` : ""}</span></p>
                <p><span className="font-medium text-foreground">Company:</span> <span className="text-muted-foreground">{pages[0].company || "-"}</span></p>
                <p><span className="font-medium text-foreground">Landing Page:</span> <span className="text-muted-foreground break-all">{getPageUrl(pages[0].token)}</span></p>
              </div>
              <Button onClick={handleSendTestEmail} className="w-full">
                Next — Open in Email Client
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Beta Email Preview Dialog */}
      <Dialog open={betaEmailDialogOpen} onOpenChange={setBetaEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview & Send Email</DialogTitle>
            <DialogDescription>
              {betaEmailTarget ? `Sending to ${betaEmailTarget.email}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={betaEmailSubject} onChange={(e) => setBetaEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={betaEmailBody}
                onChange={(e) => setBetaEmailBody(e.target.value)}
                rows={14}
                className="text-sm font-mono"
              />
            </div>
            <Button
              className="w-full"
              disabled={sendingBetaEmail || !betaEmailTarget}
              onClick={async () => {
                if (!betaEmailTarget) return;
                setSendingBetaEmail(true);
                try {
                  const { error } = await supabase.functions.invoke("send-beta-info-email", {
                    body: {
                      firstName: betaEmailTarget.first_name,
                      email: betaEmailTarget.email,
                      subject: betaEmailSubject,
                      bodyText: betaEmailBody,
                    },
                  });
                  if (error) throw error;
                  toast({ title: "Email sent!", description: `Sent to ${betaEmailTarget.email}` });
                  setBetaEmailDialogOpen(false);
                } catch (err: any) {
                  toast({ title: "Failed to send", description: err.message, variant: "destructive" });
                } finally {
                  setSendingBetaEmail(false);
                }
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingBetaEmail ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Page Views — {viewDetailsContact?.name}</DialogTitle>
            <DialogDescription>
              Total views: {viewDetailsContact?.view_count || 0}
            </DialogDescription>
          </DialogHeader>
          {viewDetailsLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading...</div>
          ) : viewDetailsData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No views yet.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewDetailsData.map((view, i) => {
                    const d = new Date(view.viewed_at);
                    return (
                      <TableRow key={view.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>{d.toLocaleDateString()}</TableCell>
                        <TableCell>{d.toLocaleTimeString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Snov.io Setup Guide Dialog */}
      <Dialog open={snovGuideOpen} onOpenChange={setSnovGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">How to Launch Your Campaign in Snov.io</DialogTitle>
            <DialogDescription>
              Your personalized landing pages are ready and synced. Follow these steps to create and launch your drip campaign in Snov.io.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* What we've done */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">What's already done</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We've generated a unique personalized landing page for each contact and added them to your Snov.io list with the URL stored in a custom field called <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">landing_page</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Create the "landing_page" custom field in Snov.io</h4>
                <p className="text-sm text-muted-foreground">
                  Before anything else, you need to create a custom field so Snov.io knows where to store each contact's personalized URL.
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1.5 ml-1">
                  <li>In Snov.io, click on any <strong>prospect list</strong> to open it</li>
                  <li>Click the <strong>"+"</strong> column header (or <strong>"Manage columns"</strong>) on the right side of the table</li>
                  <li>Click <strong>"Add custom field"</strong></li>
                  <li>Set the field name to exactly: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">landing_page</code></li>
                  <li>Choose <strong>Text</strong> as the data type, then save</li>
                </ol>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 mt-2">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> The field name must be exactly <code className="bg-muted px-1 py-0.5 rounded font-mono">landing_page</code> (lowercase, with underscore). This creates the <code className="bg-muted px-1 py-0.5 rounded font-mono">{"{{landing_page}}"}</code> variable you'll use in your emails. You only need to do this once — it applies to all future campaigns.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Create a new campaign in Snov.io</h4>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>Campaigns</strong> in the left sidebar and click <strong>"New Campaign"</strong>. Give it a name that matches your campaign here.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Select the synced list as your recipient source</h4>
                <p className="text-sm text-muted-foreground">
                  When prompted to choose recipients, select the <strong>target list</strong> you chose in the previous step — this is the list we synced your contacts to. It should already contain all your contacts with their personalized URLs.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Write your email and insert the personalized link</h4>
                <p className="text-sm text-muted-foreground">
                  In the email editor, write your message. When you want to include the personalized landing page link, use the variable:
                </p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm text-foreground flex items-center justify-between">
                  <span>{"{{landing_page}}"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText("{{landing_page}}");
                      toast({ title: "Copied to clipboard!" });
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  For example, your email might look like:
                </p>
                <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2 italic">
                  <p>Hi {"{{first_name}}"},</p>
                  <p>I put together a personalized offer for you. This page has the information we discussed. Check it out here:</p>
                  <p className="text-primary font-medium not-italic">{"{{landing_page}}"}</p>
                  <p>Let me know what you think!</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> You can also use other Snov.io variables like <code className="bg-muted px-1 py-0.5 rounded">{"{{first_name}}"}</code> and <code className="bg-muted px-1 py-0.5 rounded">{"{{company}}"}</code> to personalize further.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Configure settings & launch</h4>
                <p className="text-sm text-muted-foreground">
                  Set your sending schedule, daily sending limits, and sender email address. When you're ready, click <strong>"Start"</strong> to launch the campaign. Snov.io will automatically send each contact their unique personalized link.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">6</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Track results here</h4>
                <p className="text-sm text-muted-foreground">
                  Once your campaign is running, come back here and click <strong>"View Stats"</strong> to see opens, replies, and clicks pulled from Snov.io. You can also see how many times each contact viewed their personalized landing page in the contacts table.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-3">
              <a href="https://app.snov.io/campaigns" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full">
                  Continue to Snov.io
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Button variant="outline" onClick={() => setSnovGuideOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;