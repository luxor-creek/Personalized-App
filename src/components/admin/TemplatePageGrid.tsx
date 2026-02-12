import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TemplateMiniPreview from "@/components/admin/TemplateMiniPreview";
import {
  Search,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Hammer,
  LayoutGrid,
  List,
  MoreHorizontal,
  Radio,
} from "lucide-react";

interface LandingPageTemplate {
  id: string;
  name: string;
  slug: string;
  thumbnail_url?: string | null;
  user_id?: string | null;
  is_builder_template?: boolean;
  hero_headline?: string | null;
  hero_badge?: string | null;
  hero_subheadline?: string | null;
  logo_url?: string | null;
  hero_video_thumbnail_url?: string | null;
  updated_at?: string;
}

interface TemplatePageGridProps {
  templates: LandingPageTemplate[];
  userId: string | undefined;
  isAdmin: boolean;
  liveTemplateIds: Set<string>;
  liveTemplateCampaigns: Record<string, string[]>;
  duplicating: string | null;
  editingTemplateName: string | null;
  templateNameDraft: string;
  onSetEditingTemplateName: (id: string | null) => void;
  onSetTemplateNameDraft: (name: string) => void;
  onSaveTemplateName: (id: string) => void;
  onPreview: (slug: string, isBuilder: boolean) => void;
  onEdit: (template: LandingPageTemplate) => void;
  onLiveWarning: (name: string, campaigns: string[]) => void;
  onLiveWarningEdit: (name: string, campaigns: string[], slug: string, isBuilder: boolean) => void;
  onDuplicate: (slug: string) => void;
  onForceDuplicate: (slug: string) => void;
  onDelete: (slug: string, name: string) => void;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "live" | "draft";
type SortMode = "updated" | "name" | "created";

export default function TemplatePageGrid({
  templates,
  userId,
  isAdmin,
  liveTemplateIds,
  liveTemplateCampaigns,
  duplicating,
  editingTemplateName,
  templateNameDraft,
  onSetEditingTemplateName,
  onSetTemplateNameDraft,
  onSaveTemplateName,
  onPreview,
  onLiveWarning,
  onLiveWarningEdit,
  onDuplicate,
  onForceDuplicate,
  onDelete,
}: TemplatePageGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("updated");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const myTemplates = useMemo(() => {
    let list = templates.filter((t) => t.user_id === userId);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === "live") list = list.filter((t) => liveTemplateIds.has(t.id));
    if (filter === "draft") list = list.filter((t) => !liveTemplateIds.has(t.id));

    // Sort
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      // Default: updated desc (fallback to name)
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [templates, userId, search, filter, sort, liveTemplateIds]);

  const libraryTemplates = useMemo(() => {
    let list = templates.filter((t) => !t.user_id);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [templates, search]);

  return (
    <div className="space-y-8">
      {/* My Templates */}
      <div>
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Templates</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Templates you've cloned and customized for your campaigns.
            </p>
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Build from scratch */}
            <Link
              to="/builder"
              className="group rounded-xl border border-dashed border-border hover:border-primary/40 overflow-hidden transition-colors"
            >
              <div className="aspect-video bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                <div className="text-center p-4">
                  <Hammer className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2 group-hover:text-primary/70 transition-colors" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Build from Scratch
                  </p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground mb-1">Page Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom page with the visual builder.
                </p>
              </div>
            </Link>

            {myTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isLive={liveTemplateIds.has(t.id)}
                liveCampaigns={liveTemplateCampaigns[t.id] || []}
                duplicating={duplicating}
                editingTemplateName={editingTemplateName}
                templateNameDraft={templateNameDraft}
                isOwner
                isAdmin={isAdmin}
                onSetEditingTemplateName={onSetEditingTemplateName}
                onSetTemplateNameDraft={onSetTemplateNameDraft}
                onSaveTemplateName={onSaveTemplateName}
                onPreview={onPreview}
                onLiveWarning={onLiveWarning}
                onLiveWarningEdit={onLiveWarningEdit}
                onDuplicate={onForceDuplicate}
                onDelete={onDelete}
              />
            ))}

            {myTemplates.length === 0 && !search && (
              <div className="rounded-xl border border-dashed border-border overflow-hidden">
                <div className="aspect-video bg-muted/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Copy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No templates yet</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-muted-foreground mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground">
                    {isAdmin
                      ? 'Browse the Template Library below and click "Use Template" to clone one.'
                      : "Create a new page from scratch using the Builder."}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {myTemplates.map((t) => (
              <TemplateListRow
                key={t.id}
                template={t}
                isLive={liveTemplateIds.has(t.id)}
                liveCampaigns={liveTemplateCampaigns[t.id] || []}
                duplicating={duplicating}
                isAdmin={isAdmin}
                onPreview={onPreview}
                onLiveWarning={onLiveWarning}
                onLiveWarningEdit={onLiveWarningEdit}
                onDuplicate={onForceDuplicate}
                onDelete={onDelete}
              />
            ))}
            {myTemplates.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {search ? "No matching templates." : "No templates yet."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Library */}
      {isAdmin && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Template Library</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Browse pre-built templates. Click "Use Template" to clone one into your account.
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {libraryTemplates.map((t) => (
              <div
                key={t.id}
                className="group rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {t.thumbnail_url ? (
                    <img
                      src={t.thumbnail_url}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <TemplateMiniPreview slug={t.slug} isBuilderTemplate={!!t.is_builder_template} thumbnailUrl={t.thumbnail_url} />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">Pre-built template ready to customize.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onDuplicate(t.slug)}
                      disabled={duplicating === t.slug}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {duplicating === t.slug ? "Cloning…" : "Use Template"}
                    </Button>
                    {isAdmin && (
                      <Link to={`/template-editor/${t.slug}`}>
                        <Button variant="ghost" size="sm" title="Admin: Edit library template">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {libraryTemplates.length === 0 && (
              <p className="text-muted-foreground col-span-full text-sm">No library templates available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Grid Card ─── */

function TemplateCard({
  template: t,
  isLive,
  liveCampaigns,
  duplicating,
  editingTemplateName,
  templateNameDraft,
  isOwner,
  isAdmin,
  onSetEditingTemplateName,
  onSetTemplateNameDraft,
  onSaveTemplateName,
  onPreview,
  onLiveWarning,
  onLiveWarningEdit,
  onDuplicate,
  onDelete,
}: {
  template: LandingPageTemplate;
  isLive: boolean;
  liveCampaigns: string[];
  duplicating: string | null;
  editingTemplateName: string | null;
  templateNameDraft: string;
  isOwner: boolean;
  isAdmin: boolean;
  onSetEditingTemplateName: (id: string | null) => void;
  onSetTemplateNameDraft: (name: string) => void;
  onSaveTemplateName: (id: string) => void;
  onPreview: (slug: string, isBuilder: boolean) => void;
  onLiveWarning: (name: string, campaigns: string[]) => void;
  onLiveWarningEdit: (name: string, campaigns: string[], slug: string, isBuilder: boolean) => void;
  onDuplicate: (slug: string) => void;
  onDelete: (slug: string, name: string) => void;
}) {
  const handleEdit = () => {
    if (isLive) {
      onLiveWarningEdit(t.name, liveCampaigns, t.slug, !!t.is_builder_template);
    }
    // Non-live edit handled by Link below
  };

  return (
    <div className="group rounded-xl border border-border/60 overflow-hidden hover:border-border transition-colors bg-card">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {t.thumbnail_url ? (
          <img
            src={t.thumbnail_url}
            alt={t.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <TemplateMiniPreview slug={t.slug} isBuilderTemplate={!!t.is_builder_template} thumbnailUrl={t.thumbnail_url} />
        )}
        {/* Status dot — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isLive ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onLiveWarning(t.name, liveCampaigns);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-xs text-foreground"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        {editingTemplateName === t.id ? (
          <Input
            autoFocus
            value={templateNameDraft}
            onChange={(e) => onSetTemplateNameDraft(e.target.value)}
            onBlur={() => onSaveTemplateName(t.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveTemplateName(t.id);
              if (e.key === "Escape") onSetEditingTemplateName(null);
            }}
            className="h-8 text-sm font-semibold mb-1"
          />
        ) : (
          <h3
            className="font-semibold text-foreground mb-0.5 cursor-pointer hover:text-primary transition-colors text-base leading-snug"
            onClick={() => {
              onSetEditingTemplateName(t.id);
              onSetTemplateNameDraft(t.name);
            }}
            title="Click to rename"
          >
            {t.name}
            <Pencil className="inline w-3 h-3 text-muted-foreground/50 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        )}
        <p className="text-xs text-muted-foreground/70 font-mono mb-4">{t.slug}</p>

        {/* Actions row */}
        <div className="flex items-center gap-2">
          {/* Primary: Edit */}
          {isLive ? (
            <Button size="sm" className="flex-1" onClick={handleEdit}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          ) : (
            <Link
              to={t.is_builder_template ? `/builder/${t.slug}` : `/template-editor/${t.slug}`}
              className="flex-1"
            >
              <Button size="sm" className="w-full">
                <Pencil className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
            </Link>
          )}

          {/* Secondary: View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(t.slug, !!t.is_builder_template)}
            className="text-muted-foreground hover:text-foreground px-2.5"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Overflow menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2.5">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDuplicate(t.slug)}
                disabled={duplicating === t.slug}
              >
                <Copy className="w-4 h-4 mr-2" />
                {duplicating === t.slug ? "Copying…" : "Duplicate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(t.slug, t.name)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

/* ─── List Row ─── */

function TemplateListRow({
  template: t,
  isLive,
  liveCampaigns,
  duplicating,
  isAdmin,
  onPreview,
  onLiveWarning,
  onLiveWarningEdit,
  onDuplicate,
  onDelete,
}: {
  template: LandingPageTemplate;
  isLive: boolean;
  liveCampaigns: string[];
  duplicating: string | null;
  isAdmin: boolean;
  onPreview: (slug: string, isBuilder: boolean) => void;
  onLiveWarning: (name: string, campaigns: string[]) => void;
  onLiveWarningEdit: (name: string, campaigns: string[], slug: string, isBuilder: boolean) => void;
  onDuplicate: (slug: string) => void;
  onDelete: (slug: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Status dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${isLive ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
        title={isLive ? "Live" : "Draft"}
      />

      {/* Name & slug */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{t.name}</p>
        <p className="text-xs text-muted-foreground/60 font-mono truncate">{t.slug}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isLive ? (
          <Button
            size="sm"
            className="h-8"
            onClick={() =>
              onLiveWarningEdit(t.name, liveCampaigns, t.slug, !!t.is_builder_template)
            }
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        ) : (
          <Link to={t.is_builder_template ? `/builder/${t.slug}` : `/template-editor/${t.slug}`}>
            <Button size="sm" className="h-8">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          onClick={() => onPreview(t.slug, !!t.is_builder_template)}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground px-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate(t.slug)} disabled={duplicating === t.slug}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(t.slug, t.name)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
