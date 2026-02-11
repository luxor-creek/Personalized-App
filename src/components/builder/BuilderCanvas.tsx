import { BuilderSection } from "@/types/builder";
import SectionRenderer from "./SectionRenderer";
import AIPageGenerator from "./AIPageGenerator";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, Copy, Sparkles, Hammer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BuilderCanvasProps {
  sections: BuilderSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onAIGenerate: (sections: BuilderSection[]) => void;
  manualModeActive: boolean;
  onStartManual: () => void;
}

const BuilderCanvas = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onMoveSection,
  onDeleteSection,
  onDuplicateSection,
  onAIGenerate,
  manualModeActive,
  onStartManual,
}: BuilderCanvasProps) => {
  const showChooser = sections.length === 0 && !manualModeActive;

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="min-h-full bg-muted/30">
        {sections.length === 0 ? (
          showChooser ? (
            <div className="flex items-center justify-center h-[calc(100vh-56px)]">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <AIPageGenerator onGenerate={onAIGenerate} inline />
                <button
                  onClick={onStartManual}
                  className="group flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all w-64"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Hammer className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-base font-semibold text-foreground">Build Yourself</span>
                  <span className="text-xs text-muted-foreground text-center">Start from scratch using the section palette</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-center">
              <div>
                <p className="text-lg text-muted-foreground mb-2">Your page is empty</p>
                <p className="text-sm text-muted-foreground">
                  Click sections in the left panel to start building your page.
                </p>
              </div>
            </div>
          )
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
                  {/* Section controls - visible on hover (desktop) or always (mobile) */}
                  <div className="absolute top-2 left-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 md:h-7 md:w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'up'); }}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 md:h-7 md:w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'down'); }}
                      disabled={index === sections.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 md:h-7 md:w-7 p-0 shadow-md"
                      onClick={(e) => { e.stopPropagation(); onDuplicateSection(section.id); }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 md:h-7 md:w-7 p-0 shadow-md"
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
