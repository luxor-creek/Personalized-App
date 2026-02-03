import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import kickerLogo from "@/assets/kicker-logo.png";
import { Plus, Upload, ExternalLink, Trash2, BarChart3, LogOut, Eye, Lock, UserPlus, Layout, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";
import { Textarea } from "@/components/ui/textarea";
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

const ADMIN_PASSWORD = "green123!";

interface Campaign {
  id: string;
  name: string;
  created_at: string;
  page_count?: number;
  view_count?: number;
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
  const { toast } = useToast();
  
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [pages, setPages] = useState<PersonalizedPage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create campaign dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  
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

  // Check for saved session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_authenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchPages(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
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
    if (!newCampaignName.trim()) return;

    try {
      const { error } = await supabase.from("campaigns").insert({
        name: newCampaignName.trim(),
        user_id: "00000000-0000-0000-0000-000000000000", // Placeholder for password-only auth
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

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={kickerLogo} alt="Kicker Video" className="h-10 mx-auto mb-6" />
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-muted-foreground mt-2">
              Enter password to manage landing pages
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className={passwordError ? "border-destructive" : ""}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Access Admin
            </Button>
          </form>
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
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Landing Page
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Lock
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Landing Page Templates</h2>
              <p className="text-muted-foreground">
                Choose a landing page template to preview or use for your campaigns.
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
                      Default
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">Police Recruitment Demo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recruitment video landing page for law enforcement agencies.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Link to="/admin/edit/police-recruitment" className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Page
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </a>
                    <a href="/" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* B2B Demo Landing Page */}
              <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-amber-800 font-medium text-sm">B2B Video Production</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-1 bg-amber-500/90 text-gray-900 text-xs font-medium rounded">
                      New
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">B2B Product Demo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional B2B video production services landing page.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Link to="/admin/edit/b2b-demo" className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Page
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <a href="/b2b-demo" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </a>
                    <a href="/b2b-demo" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Wine Video Landing Page */}
              <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-cyan-50 to-blue-100 relative overflow-hidden flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-indigo-800 font-medium text-sm">Wine Video Production</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-1 bg-indigo-500/90 text-white text-xs font-medium rounded">
                      New
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">Wine Video Production</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    $20 per wine video landing page for wine marketers.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Link to="/admin/edit/wine-video" className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Page
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <a href="/wine-video" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </a>
                    <a href="/wine-video" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Add New Template Card */}
              <div className="group bg-card rounded-xl border border-dashed border-border overflow-hidden hover:border-primary/50 transition-all flex items-center justify-center min-h-[280px]">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-1">Add Template</h3>
                  <p className="text-sm text-muted-foreground/70">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="campaigns">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Campaigns Sidebar */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Campaigns</h2>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Campaign</DialogTitle>
                        <DialogDescription>
                          Create a new campaign to organize your personalized landing pages.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="campaignName">Campaign Name</Label>
                          <Input
                            id="campaignName"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            placeholder="e.g., Pittsburgh PD Q1 2024"
                          />
                        </div>
                        <Button onClick={createCampaign} className="w-full">
                          Create Campaign
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {loading ? (
                    <div className="text-muted-foreground text-sm py-4 animate-pulse">
                      Loading campaigns...
                    </div>
                  ) : campaigns.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">
                      No campaigns yet. Create one to get started.
                    </p>
                  ) : (
                    campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCampaign?.id === campaign.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{campaign.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>{campaign.page_count} pages</span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {campaign.view_count} views
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCampaign(campaign.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pages Content */}
              <div className="lg:col-span-2">
                {selectedCampaign ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          {selectedCampaign.name}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {pages.length} personalized pages
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Add Single Person Dialog */}
                        <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="default">
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Person
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Person</DialogTitle>
                              <DialogDescription>
                                Create a personalized landing page for one person
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name *</Label>
                                  <Input
                                    id="firstName"
                                    value={newPerson.first_name}
                                    onChange={(e) => setNewPerson({ ...newPerson, first_name: e.target.value })}
                                    placeholder="James"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input
                                    id="lastName"
                                    value={newPerson.last_name}
                                    onChange={(e) => setNewPerson({ ...newPerson, last_name: e.target.value })}
                                    placeholder="Smith"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                  id="company"
                                  value={newPerson.company}
                                  onChange={(e) => setNewPerson({ ...newPerson, company: e.target.value })}
                                  placeholder="ACME Corp"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="customMessage">Custom Message (optional)</Label>
                                <Textarea
                                  id="customMessage"
                                  value={newPerson.custom_message}
                                  onChange={(e) => setNewPerson({ ...newPerson, custom_message: e.target.value })}
                                  placeholder="We created this video specifically for your team..."
                                  rows={3}
                                />
                              </div>
                              <Button 
                                onClick={addSinglePerson} 
                                className="w-full"
                                disabled={!newPerson.first_name.trim() || addingPerson}
                              >
                                {addingPerson ? "Creating..." : "Create Page & Copy Link"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Upload CSV Dialog */}
                        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
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
                              <div className="space-y-2">
                                <Label htmlFor="csvFile">CSV File</Label>
                                <Input
                                  id="csvFile"
                                  type="file"
                                  accept=".csv"
                                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                <p className="font-medium mb-1">Example CSV format:</p>
                                <code className="text-xs">
                                  first_name,last_name,company,custom_message<br/>
                                  James,Smith,ACME Corp,We're excited to share this with you<br/>
                                  Sarah,Johnson,XYZ Inc,
                                </code>
                              </div>
                              <Button 
                                onClick={handleCsvUpload} 
                                className="w-full"
                                disabled={!csvFile || uploading}
                              >
                                {uploading ? "Creating pages..." : "Upload & Create Pages"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {pages.length === 0 ? (
                      <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No pages yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Upload a CSV to create personalized landing pages
                        </p>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Views</TableHead>
                              <TableHead>Link</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pages.map((page) => (
                              <TableRow key={page.id}>
                                <TableCell>
                                  {page.first_name} {page.last_name}
                                </TableCell>
                                <TableCell>{page.company || "-"}</TableCell>
                                <TableCell>{page.view_count}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {page.token.substring(0, 8)}...
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(getPageUrl(page.token))}
                                    >
                                      Copy
                                    </Button>
                                    <a
                                      href={getPageUrl(page.token)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="ghost" size="sm">
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </a>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletePage(page.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a campaign
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a campaign from the left to manage its personalized pages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
