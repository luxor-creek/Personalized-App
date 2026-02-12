import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Play, Globe, Clock, User, MousePointerClick, ArrowDownToLine, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface ProspectDetailPanelProps {
  pageId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  company: string | null;
  photoUrl?: string | null;
  onBack: () => void;
}

interface ViewEvent {
  id: string;
  viewed_at: string;
  user_agent: string | null;
  ip_address: string | null;
  time_on_page_seconds: number | null;
  max_scroll_depth: number | null;
  is_return_visit: boolean;
}

interface VideoClickEvent {
  id: string;
  clicked_at: string;
  user_agent: string | null;
}

interface LinkClickEvent {
  id: string;
  clicked_at: string;
  link_label: string | null;
  link_url: string | null;
  user_agent: string | null;
}

const ProspectDetailPanel = ({ pageId, firstName, lastName, email, company, photoUrl, onBack }: ProspectDetailPanelProps) => {
  const [views, setViews] = useState<ViewEvent[]>([]);
  const [videoClicks, setVideoClicks] = useState<VideoClickEvent[]>([]);
  const [linkClicks, setLinkClicks] = useState<LinkClickEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [pageId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [viewsRes, clicksRes, linksRes] = await Promise.all([
        supabase
          .from("page_views")
          .select("id, viewed_at, user_agent, ip_address, time_on_page_seconds, max_scroll_depth, is_return_visit")
          .eq("personalized_page_id", pageId)
          .order("viewed_at", { ascending: false }),
        supabase
          .from("video_clicks")
          .select("id, clicked_at, user_agent")
          .eq("personalized_page_id", pageId)
          .order("clicked_at", { ascending: false }),
        supabase
          .from("link_clicks")
          .select("id, clicked_at, link_label, link_url, user_agent")
          .eq("personalized_page_id", pageId)
          .order("clicked_at", { ascending: false }),
      ]);

      setViews(viewsRes.data || []);
      setVideoClicks(clicksRes.data || []);
      setLinkClicks((linksRes.data as LinkClickEvent[]) || []);
    } catch (err) {
      console.error("Error fetching prospect details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${firstName} ${lastName || ""}`.trim();

  const timeline = [
    ...views.map(v => ({
      type: "view" as const,
      time: v.viewed_at,
      userAgent: v.user_agent,
      id: v.id,
      label: null as string | null,
      timeOnPage: v.time_on_page_seconds,
      scrollDepth: v.max_scroll_depth,
      isReturn: v.is_return_visit,
    })),
    ...videoClicks.map(c => ({ type: "video" as const, time: c.clicked_at, userAgent: c.user_agent, id: c.id, label: null as string | null, timeOnPage: null as number | null, scrollDepth: null as number | null, isReturn: false })),
    ...linkClicks.map(l => ({ type: "link" as const, time: l.clicked_at, userAgent: l.user_agent, id: l.id, label: l.link_label, timeOnPage: null as number | null, scrollDepth: null as number | null, isReturn: false })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", second: "2-digit",
    });
  };

  const parseDevice = (ua: string | null) => {
    if (!ua) return "Unknown";
    if (/mobile/i.test(ua)) return "Mobile";
    if (/tablet/i.test(ua)) return "Tablet";
    return "Desktop";
  };

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
        <span className="text-sm text-muted-foreground">Back</span>
      </div>

      {/* Prospect Info + Timeline - responsive layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Prospect Info Card */}
        <div className="bg-card rounded-lg border border-border p-5 space-y-3 w-full lg:w-64 shrink-0">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">{fullName}</h3>
              {company && <p className="text-sm text-muted-foreground truncate">{company}</p>}
            </div>
          </div>

          {email && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">Email</p>
              <p className="text-sm text-foreground break-all">{email}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-foreground">{views.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" /> Views
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-primary">{videoClicks.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Play className="w-3 h-3" /> Videos
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-foreground">{linkClicks.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MousePointerClick className="w-3 h-3" /> Clicks
              </p>
            </div>
          </div>

          {/* Engagement Metrics */}
          {views.length > 0 && (() => {
            const withTime = views.filter(v => v.time_on_page_seconds != null);
            const avgTime = withTime.length > 0 ? Math.round(withTime.reduce((s, v) => s + (v.time_on_page_seconds || 0), 0) / withTime.length) : null;
            const bestScroll = Math.max(...views.map(v => v.max_scroll_depth || 0));
            const returnCount = views.filter(v => v.is_return_visit).length;
            return (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {avgTime != null ? `${Math.floor(avgTime / 60)}:${String(avgTime % 60).padStart(2, "0")}` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Avg Time
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{bestScroll > 0 ? `${bestScroll}%` : "—"}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <ArrowDownToLine className="w-3 h-3" /> Scroll
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{returnCount}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" /> Returns
                  </p>
                </div>
              </div>
            );
          })()}

          {views.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">First Visit</p>
              <p className="text-sm text-foreground">
                {formatTime(views[views.length - 1].viewed_at)}
              </p>
            </div>
          )}

          {views.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">Last Visit</p>
              <p className="text-sm text-foreground">
                {formatTime(views[0].viewed_at)}
              </p>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="flex-1 bg-card rounded-lg border border-border overflow-x-auto min-w-0">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Activity Timeline
            </h4>
          </div>
          {timeline.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No activity recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="hidden sm:table-cell">Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {formatTime(event.time)}
                    </TableCell>
                    <TableCell>
                      {event.type === "view" ? (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          <Globe className="w-3 h-3" /> Page View
                        </Badge>
                      ) : event.type === "video" ? (
                        <Badge variant="default" className="text-xs bg-primary flex items-center gap-1 w-fit">
                          <Play className="w-3 h-3" /> Video Play
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
                          <MousePointerClick className="w-3 h-3" /> {event.label || "Link Click"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {event.type === "view" && event.timeOnPage != null
                        ? `${Math.floor(event.timeOnPage / 60)}:${String(event.timeOnPage % 60).padStart(2, "0")}${event.scrollDepth != null ? ` · ${event.scrollDepth}%` : ""}`
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {parseDevice(event.userAgent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProspectDetailPanel;
