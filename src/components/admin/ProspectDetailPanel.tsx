import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Play, Globe, Clock, User } from "lucide-react";
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
  onBack: () => void;
}

interface ViewEvent {
  id: string;
  viewed_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

interface VideoClickEvent {
  id: string;
  clicked_at: string;
  user_agent: string | null;
}

const ProspectDetailPanel = ({ pageId, firstName, lastName, email, company, onBack }: ProspectDetailPanelProps) => {
  const [views, setViews] = useState<ViewEvent[]>([]);
  const [videoClicks, setVideoClicks] = useState<VideoClickEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [pageId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [viewsRes, clicksRes] = await Promise.all([
        supabase
          .from("page_views")
          .select("id, viewed_at, user_agent, ip_address")
          .eq("personalized_page_id", pageId)
          .order("viewed_at", { ascending: false }),
        supabase
          .from("video_clicks")
          .select("id, clicked_at, user_agent")
          .eq("personalized_page_id", pageId)
          .order("clicked_at", { ascending: false }),
      ]);

      setViews(viewsRes.data || []);
      setVideoClicks(clicksRes.data || []);
    } catch (err) {
      console.error("Error fetching prospect details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${firstName} ${lastName || ""}`.trim();

  // Merge views and video clicks into a single timeline
  const timeline = [
    ...views.map(v => ({ type: "view" as const, time: v.viewed_at, userAgent: v.user_agent, id: v.id })),
    ...videoClicks.map(c => ({ type: "video" as const, time: c.clicked_at, userAgent: c.user_agent, id: c.id })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
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

      {/* Prospect Info Card */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-card rounded-lg border border-border p-5 space-y-3 sm:w-64 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{fullName}</h3>
              {company && <p className="text-sm text-muted-foreground">{company}</p>}
            </div>
          </div>

          {email && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">Email</p>
              <p className="text-sm text-foreground">{email}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{views.length}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" /> Page Views
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary">{videoClicks.length}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Play className="w-3 h-3" /> Video Plays
              </p>
            </div>
          </div>

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
        <div className="flex-1 bg-card rounded-lg border border-border overflow-x-auto">
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
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatTime(event.time)}
                    </TableCell>
                    <TableCell>
                      {event.type === "view" ? (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          <Globe className="w-3 h-3" /> Page View
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-primary flex items-center gap-1 w-fit">
                          <Play className="w-3 h-3" /> Video Play
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
