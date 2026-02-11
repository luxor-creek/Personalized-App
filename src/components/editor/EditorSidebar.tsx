import { Save, X, Eye, Tag, Type, Image, Video, ArrowLeft, Palette, Menu, LayoutList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionToggle {
  key: string;
  label: string;
}

interface EditorSidebarProps {
  templateName: string;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
  onInsertToken?: (token: string) => void;
  accentColor?: string | null;
  onAccentColorChange?: (color: string) => void;
  sectionToggles?: SectionToggle[];
  sectionVisibility?: Record<string, boolean>;
  onSectionVisibilityChange?: (key: string, visible: boolean) => void;
}

const PERSONALIZATION_TOKENS = [
  { token: "{{first_name}}", label: "First Name", description: "Recipient's first name" },
  { token: "{{last_name}}", label: "Last Name", description: "Recipient's last name" },
  { token: "{{company}}", label: "Company", description: "Recipient's company name" },
  { token: "{{company_name}}", label: "Company Name", description: "Alias for company" },
  { token: "{{full_name}}", label: "Full Name", description: "First + Last name combined" },
  { token: "{{landing_page}}", label: "Landing Page URL", description: "Unique page URL" },
  { token: "{{custom_field}}", label: "Custom Field", description: "Custom data field" },
];

const PRESET_COLORS = [
  { label: "Purple", hex: "#7c5cfc", hsl: "252 64% 60%" },
  { label: "Blue", hex: "#3b82f6", hsl: "217 91% 60%" },
  { label: "Red", hex: "#ef4444", hsl: "0 84% 60%" },
  { label: "Orange", hex: "#f97316", hsl: "25 95% 53%" },
  { label: "Green", hex: "#22c55e", hsl: "142 71% 45%" },
  { label: "Teal", hex: "#14b8a6", hsl: "173 80% 40%" },
  { label: "Pink", hex: "#ec4899", hsl: "330 81% 60%" },
  { label: "Gold", hex: "#eab308", hsl: "48 96% 47%" },
];

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 2) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SidebarContent = ({
  templateName,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  onPreview,
  onInsertToken,
  accentColor,
  onAccentColorChange,
  sectionToggles,
  sectionVisibility,
  onSectionVisibilityChange,
}: EditorSidebarProps) => {
  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    onInsertToken?.(token);
  };

  const [customHex, setCustomHex] = useState("#7c5cfc");

  const handlePresetClick = (hsl: string) => {
    onAccentColorChange?.(hsl);
  };

  const handleCustomColorChange = useCallback((hex: string) => {
    setCustomHex(hex);
    onAccentColorChange?.(hexToHsl(hex));
  }, [onAccentColorChange]);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-5 h-5 text-primary" />
          <span className="font-semibold">Template Editor</span>
        </div>
        <p className="text-sm text-gray-400">{templateName}</p>
        {hasChanges && (
          <span className="inline-block mt-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
            Unsaved changes
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Variable Picker */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Insert Variable
            </h3>
            <Select onValueChange={(token) => { navigator.clipboard.writeText(token); onInsertToken?.(token); }}>
              <SelectTrigger className="h-9 bg-gray-800 border-gray-600 text-gray-200 text-xs">
                <SelectValue placeholder="Copy a variable…" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 z-[100]">
                {PERSONALIZATION_TOKENS.map((item) => (
                  <SelectItem key={item.token} value={item.token} className="text-xs text-gray-200 focus:bg-gray-700 focus:text-white">
                    <code className="font-mono text-primary mr-2">{item.token}</code>
                    <span className="text-gray-400">{item.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">Select to copy, then paste into any text field.</p>
          </div>

          <Separator className="bg-gray-700" />

          {/* Accent Color Picker */}
          {onAccentColorChange && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Accent Color
              </h3>
              <p className="text-xs text-gray-400">
                Change the template's primary color. Affects buttons, icons, and highlights.
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.label}
                    title={c.label}
                    onClick={() => handlePresetClick(c.hsl)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                      accentColor === c.hsl ? "border-white scale-110" : "border-gray-600"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs text-gray-400">Custom color</span>
              </div>
            </div>
          )}

          {/* Section Visibility Toggles */}
          {sectionToggles && sectionToggles.length > 0 && onSectionVisibilityChange && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <LayoutList className="w-4 h-4" />
                  Section Visibility
                </h3>
                <p className="text-xs text-gray-400">
                  Toggle sections on or off. Hidden sections won't appear on the live page.
                </p>
                <div className="space-y-3">
                  {sectionToggles.map((toggle) => (
                    <div key={toggle.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{toggle.label}</span>
                      <Switch
                        checked={sectionVisibility?.[toggle.key] !== false}
                        onCheckedChange={(checked) => onSectionVisibilityChange(toggle.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="bg-gray-700" />
            </>
          )}




          {/* Tips */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Tips</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>• Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Enter</kbd> to save text changes</li>
              <li>• Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Esc</kbd> to cancel editing</li>
              <li>• Use "Insert Variable" button when editing text</li>
              <li>• Preview changes before saving</li>
            </ul>
          </div>
        </div>
      </ScrollArea>

      {/* Action buttons */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex-1 justify-center text-white border-gray-600 hover:bg-gray-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "flex-1 bg-primary hover:bg-primary/90",
              !hasChanges && "opacity-50"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>
      </div>
    </>
  );
};

const EditorSidebar = (props: EditorSidebarProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Floating toggle button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 bg-gray-900 text-white border-gray-700 flex flex-col">
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col h-screen fixed right-0 top-0 z-50 shadow-2xl">
      <SidebarContent {...props} />
    </div>
  );
};

export default EditorSidebar;
