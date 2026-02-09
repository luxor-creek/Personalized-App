import { BuilderSection } from "@/types/builder";
import SectionRenderer from "./SectionRenderer";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BuilderCanvasProps {
  sections: BuilderSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
}

const BuilderCanvas = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onMoveSection,
  onDeleteSection,
  onDuplicateSection,
}: BuilderCanvasProps) => {
  return (
    <ScrollArea className="flex-1 h-full">
      <div className="min-h-full bg-muted/30">
        {sections.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-center">
            <div>
              <p className="text-lg text-muted-foreground mb-2">Your page is empty</p>
              <p className="text-sm text-muted-foreground">
                Click sections in the left panel to start building your page.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Page preview */}
            <div className="max-w-[1200px] mx-auto bg-white shadow-lg min-h-[600px]">
              {sections.map((section, index) => (
                <div key={section.id} className="relative group">
                  <SectionRenderer
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onClick={() => onSelectSection(section.id)}
                  />
                  {/* Section controls - visible on hover */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'up'); }}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'down'); }}
                      disabled={index === sections.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onDuplicateSection(section.id); }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default BuilderCanvas;
