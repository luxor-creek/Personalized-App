import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Play, Trophy, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import ProspectDetailPanel from "./ProspectDetailPanel";

interface CampaignAnalyticsPanelProps {
  campaignId: string;
  campaignName: string;
  onBack: () => void;
}

interface ProspectEngagement {
  pageId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  company: string | null;
  viewCount: number;
  videoClicks: number;
  lastViewed: string | null;
}

const CampaignAnalyticsPanel = ({ campaignId, campaignName, onBack }: CampaignAnalyticsPanelProps) => {
  const [prospects, setProspects] = useState<ProspectEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<ProspectEngagement | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: pages } = await supabase
        .from("personalized_pages")
        .select("id, first_name, last_name, email, company")
        .eq("campaign_id", campaignId);

      if (!pages || pages.length === 0) {
        setProspects([]);
        setLoading(false);
        return;
      }

      const pageIds = pages.map(p => p.id);

      const [{ data: views }, { data: clicks }] = await Promise.all([
        supabase.from("page_views").select("personalized_page_id, viewed_at").in("personalized_page_id", pageIds),
        supabase.from("video_clicks").select("personalized_page_id").in("personalized_page_id", pageIds),
      ]);

      const viewMap: Record<string, { count: number; lastViewed: string | null }> = {};
      (views || []).forEach(v => {
        if (!viewMap[v.personalized_page_id]) viewMap[v.personalized_page_id] = { count: 0, lastViewed: null };
        viewMap[v.personalized_page_id].count++;
        const current = viewMap[v.personalized_page_id].lastViewed;
        if (!current || v.viewed_at > current) viewMap[v.personalized_page_id].lastViewed = v.viewed_at;
      });

      const clickMap: Record<string, number> = {};
      (clicks || []).forEach(c => { clickMap[c.personalized_page_id] = (clickMap[c.personalized_page_id] || 0) + 1; });

      const enriched: ProspectEngagement[] = pages.map(p => ({
        pageId: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        company: p.company,
        viewCount: viewMap[p.id]?.count || 0,
        videoClicks: clickMap[p.id] || 0,
        lastViewed: viewMap[p.id]?.lastViewed || null,
      }));

      setProspects(enriched);
    } catch (err) {
      console.error("Error fetching campaign analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = useMemo(() => prospects.reduce((sum, p) => sum + p.viewCount, 0), [prospects]);
  const totalVideoClicks = useMemo(() => prospects.reduce((sum, p) => sum + p.videoClicks, 0), [prospects]);
  const uniqueViewers = useMemo(() => prospects.filter(p => p.viewCount > 0).length, [prospects]);
  const videoWatchers = useMemo(() => prospects.filter(p => p.videoClicks > 0).length, [prospects]);

  const sortedProspects = useMemo(() =>
    [...prospects].sort((a, b) => b.viewCount - a.viewCount || b.videoClicks - a.videoClicks),
    [prospects]
  );

  const maxViews = useMemo(() => Math.max(...prospects.map(p => p.viewCount), 1), [prospects]);
  const topViewers = useMemo(() => sortedProspects.filter(p => p.viewCount > 0).slice(0, 10), [sortedProspects]);

  // Show prospect detail view
  if (selectedProspect) {
    return (
      <ProspectDetailPanel
        pageId={selectedProspect.pageId}
        firstName={selectedProspect.firstName}
        lastName={selectedProspect.lastName}
        email={selectedProspect.email}
        company={selectedProspect.company}
        onBack={() => setSelectedProspect(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground">Signal Hub</h3>
          <p className="text-sm text-muted-foreground">{campaignName}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          className="bg-white text-black border-[#6d54df] hover:bg-[#6d54df]/5"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm">Total Prospects</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{prospects.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Total Page Views</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalViews}</p>
          <p className="text-xs text-muted-foreground">{uniqueViewers} unique viewer{uniqueViewers !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Play className="w-4 h-4" />
            <span className="text-sm">Video Plays</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalVideoClicks}</p>
          <p className="text-xs text-muted-foreground">{videoWatchers} watcher{videoWatchers !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Engagement Rate</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {prospects.length > 0 ? Math.round((uniqueViewers / prospects.length) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">opened their page</p>
        </div>
      </div>

      {/* Top Viewers */}
      {topViewers.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Top Viewers
          </h4>
          <div className="space-y-2">
            {topViewers.map((p, i) => (
              <div
                key={p.pageId}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors"
                onClick={() => setSelectedProspect(p)}
              >
                <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {p.firstName} {p.lastName || ""}
                    </span>
                    {p.email && <span className="text-xs text-muted-foreground truncate">{p.email}</span>}
                  </div>
                  <Progress value={(p.viewCount / maxViews) * 100} className="h-1.5 mt-1" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {p.viewCount}
                  </span>
                  {p.videoClicks > 0 && (
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      <Play className="w-3 h-3" /> {p.videoClicks}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Prospect Table */}
      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prospect</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-center">Page Views</TableHead>
              <TableHead className="text-center">Video Plays</TableHead>
              <TableHead>Last Viewed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No prospects in this campaign yet.
                </TableCell>
              </TableRow>
            ) : (
              sortedProspects.map(p => (
                <TableRow
                  key={p.pageId}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedProspect(p)}
                >
                  <TableCell className="font-medium">
                    {p.firstName} {p.lastName || ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.company || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${p.viewCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {p.viewCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${p.videoClicks > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {p.videoClicks}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.lastViewed
                      ? new Date(p.lastViewed).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                      : "—"
                    }
                  </TableCell>
                  <TableCell>
                    {p.viewCount === 0 ? (
                      <Badge variant="secondary" className="text-xs">Not viewed</Badge>
                    ) : p.videoClicks > 0 ? (
                      <Badge variant="default" className="text-xs bg-primary">Watched video</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Viewed page</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CampaignAnalyticsPanel;
