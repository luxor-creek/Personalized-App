import { SECTION_DEFAULTS, SectionType } from "@/types/builder";
import { Type, AlignLeft, Play, Image, RectangleHorizontal, MousePointerClick, FileText, Sparkles, Minus, FileDown } from "lucide-react";
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
};

interface SectionPaletteProps {
  onAddSection: (type: SectionType) => void;
}

const SectionPalette = ({ onAddSection }: SectionPaletteProps) => {
  const sectionTypes = Object.entries(SECTION_DEFAULTS) as [SectionType, typeof SECTION_DEFAULTS[SectionType]][];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Add Sections</h3>
        <p className="text-xs text-muted-foreground mt-1">Click to add a section to your page</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sectionTypes.map(([type, config]) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => onAddSection(type)}
            >
              <span className="text-primary">{ICONS[config.icon]}</span>
              <span>{config.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SectionPalette;
