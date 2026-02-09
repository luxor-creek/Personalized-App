import { SECTION_DEFAULTS, SECTION_CATEGORIES, SectionType } from "@/types/builder";
import {
  Type, AlignLeft, Play, Image, RectangleHorizontal, MousePointerClick, FileText, Sparkles, Minus, FileDown,
  Rocket, Grid3x3, MessageSquareQuote, CreditCard, HelpCircle, BarChart3, Users, Building2, Mail,
  Columns2, ListOrdered, LayoutGrid, PanelBottom, SeparatorHorizontal, Quote, Timer, ThumbsUp,
  CheckSquare, SquareStack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="w-4 h-4" />,
  AlignLeft: <AlignLeft className="w-4 h-4" />,
  Play: <Play className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  RectangleHorizontal: <RectangleHorizontal className="w-4 h-4" />,
  MousePointerClick: <MousePointerClick className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  FileDown: <FileDown className="w-4 h-4" />,
  Minus: <Minus className="w-4 h-4" />,
  Rocket: <Rocket className="w-4 h-4" />,
  Grid3x3: <Grid3x3 className="w-4 h-4" />,
  MessageSquareQuote: <MessageSquareQuote className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  Columns2: <Columns2 className="w-4 h-4" />,
  ListOrdered: <ListOrdered className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  PanelBottom: <PanelBottom className="w-4 h-4" />,
  SeparatorHorizontal: <SeparatorHorizontal className="w-4 h-4" />,
  Quote: <Quote className="w-4 h-4" />,
  Timer: <Timer className="w-4 h-4" />,
  ThumbsUp: <ThumbsUp className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  SquareStack: <SquareStack className="w-4 h-4" />,
};

interface SectionPaletteProps {
  onAddSection: (type: SectionType) => void;
}

const SectionPalette = ({ onAddSection }: SectionPaletteProps) => {
  const sectionTypes = Object.entries(SECTION_DEFAULTS) as [SectionType, typeof SECTION_DEFAULTS[SectionType]][];

  const grouped = SECTION_CATEGORIES.map((cat) => ({
    category: cat,
    items: sectionTypes.filter(([, config]) => config.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Add Sections</h3>
        <p className="text-xs text-muted-foreground mt-1">29 sections available</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{category}</p>
              <div className="space-y-1">
                {items.map(([type, config]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-auto py-2 px-2 text-xs font-normal hover:bg-accent"
                    onClick={() => onAddSection(type)}
                  >
                    <span className="text-primary">{ICONS[config.icon]}</span>
                    <span>{config.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SectionPalette;
