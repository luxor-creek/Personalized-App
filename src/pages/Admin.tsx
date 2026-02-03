import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import kickerLogo from "@/assets/kicker-logo.png";
import { Plus, Upload, ExternalLink, Trash2, BarChart3, LogOut, Eye, Layout, Pencil, Shield, Send, Mail } from "lucide-react";
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

  // Snov.io integration state
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
    }
  }, [user, isAdmin]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_page_templates")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
      
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
    }
  }, [selectedCampaign]);

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

  const handleCsvUpload = async () => {
    if (!csvFile || !selectedCampaign) return;

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

      const pagesToCreate = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        
        if (!values[firstNameIndex]) continue;

        pagesToCreate.push({
          campaign_id: selectedCampaign.id,
          template_id: selectedCampaign.template_id,
          first_name: values[firstNameIndex],
          last_name: lastNameIndex >= 0 ? values[lastNameIndex] || null : null,
          company: companyIndex >= 0 ? values[companyIndex] || null : null,
          custom_message: messageIndex >= 0 ? values[messageIndex] || null : null,
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
          <img src={kickerLogo} alt="Kicker Video" className="h-8" />
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
            <TabsTrigger value="landing-pages">
              <Layout className="w-4 h-4 mr-2" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns & Pages</TabsTrigger>
          </TabsList>

          {/* Landing Pages Tab */}
          <TabsContent value="landing-pages" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">My Templates</h2>
              <p className="text-muted-foreground">
                Templates you have customized for your campaigns.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Police Recruitment Landing Page */}
              <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={heroThumbnail} 
                    alt="Police Recruitment Video Demo" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded">
                      Template
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">Police Recruitment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional recruitment video landing page with hero section and video player.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/police-recruitment" target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    <Link to="/template-editor/police-recruitment" className="flex-1">
                      <Button size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Wine Video Landing Page */}
              <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop" 
                    alt="Wine Video Landing Page" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-1 bg-emerald-600/90 text-white text-xs font-medium rounded">
                      Template
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">Wine Video</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Elegant wine-themed landing page with video content and contact form.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/" target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    <Link to="/template-editor/wine-video" className="flex-1">
                      <Button size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* B2B Demo Landing Page */}
              <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" 
                    alt="B2B Demo Landing Page" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-1 bg-amber-600/90 text-white text-xs font-medium rounded">
                      Template
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">B2B Product Demo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional B2B landing page with pricing tiers and lead generation form.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/b2b-demo" target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    <Link to="/template-editor/b2b-demo" className="flex-1">
                      <Button size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Landing Page Templates Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">Landing Page Templates</h2>
              <p className="text-muted-foreground mb-6">
                Browse and select from our library of pre-built landing page templates.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for future generic templates */}
                <div className="group bg-card rounded-xl border border-dashed border-border overflow-hidden">
                  <div className="aspect-video bg-muted/30 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Plus className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Templates coming soon</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-muted-foreground mb-1">More Templates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      New pre-built templates will be available here.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
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
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Campaign List */}
                <div className="space-y-3">
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
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{campaign.page_count} pages</span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {campaign.view_count} views
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

                {/* Campaign Details */}
                <div className="lg:col-span-2">
                  {selectedCampaign ? (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground">
                          {selectedCampaign.name}
                        </h3>
                        <div className="flex gap-2">
                          <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
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
                          
                          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload CSV
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload CSV</DialogTitle>
                                <DialogDescription>
                                  Upload a CSV file with columns: first_name (required), last_name, company, custom_message
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

                          {/* Snov.io Send Campaign Dialog */}
                          <Dialog open={snovDialogOpen} onOpenChange={setSnovDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="default" onClick={openSnovDialog}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send via Snov.io
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
                                    {/* Source List Selection */}
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

                                    {/* Target Drip Campaign List Selection */}
                                    <div className="space-y-2">
                                      <Label>Target List (with drip campaign attached)</Label>
                                      <p className="text-xs text-muted-foreground">
                                        This list should have a drip campaign configured in Snov.io. Use {"{{country}}"} in your email template for the landing page URL.
                                      </p>
                                      <div className="grid gap-2 max-h-32 overflow-y-auto">
                                        {snovLists.map((list) => (
                                          <div
                                            key={list.id}
                                            onClick={() => setSelectedSnovCampaignList(list.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                              selectedSnovCampaignList === list.id
                                                ? "border-green-500 bg-green-500/10"
                                                : "border-border hover:border-green-500/50"
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
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                      </div>

                      {pages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No personalized pages yet.</p>
                          <p className="text-sm">Add people individually or upload a CSV file.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pages.map((page) => (
                                <TableRow key={page.id}>
                                  <TableCell>
                                    {page.first_name} {page.last_name}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {page.company || "-"}
                                  </TableCell>
                                  <TableCell>
                                    <span className="flex items-center gap-1">
                                      <BarChart3 className="w-3 h-3" />
                                      {page.view_count}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(getPageUrl(page.token))}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deletePage(page.id)}
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;