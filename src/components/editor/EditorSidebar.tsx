import { Save, X, Eye, Tag, Type, Image, Video, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  templateName: string;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
  onInsertToken?: (token: string) => void;
}

const PERSONALIZATION_TOKENS = [
  { token: "{{first_name}}", label: "First Name", description: "Recipient's first name" },
  { token: "{{last_name}}", label: "Last Name", description: "Recipient's last name" },
  { token: "{{company}}", label: "Company", description: "Recipient's company name" },
  { token: "{{full_name}}", label: "Full Name", description: "First + Last name combined" },
];

const EditorSidebar = ({
  templateName,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  onPreview,
  onInsertToken,
}: EditorSidebarProps) => {
  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    onInsertToken?.(token);
  };

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col h-screen fixed right-0 top-0 z-50 shadow-2xl">
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
          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How to Edit
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <Type className="w-4 h-4 mt-0.5 text-primary" />
                <span>Click on any text to edit it directly</span>
              </div>
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 mt-0.5 text-primary" />
                <span>Click on the video to change the Vimeo ID</span>
              </div>
              <div className="flex items-start gap-2">
                <Image className="w-4 h-4 mt-0.5 text-primary" />
                <span>Click on images to replace them with a URL</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Personalization Tokens */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Personalization Variables
            </h3>
            <p className="text-xs text-gray-400">
              Click to copy, then paste into any text field. These will be replaced with recipient data.
            </p>
            <div className="space-y-2">
              {PERSONALIZATION_TOKENS.map((item) => (
                <button
                  key={item.token}
                  onClick={() => copyToClipboard(item.token)}
                  className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                >
                  <code className="text-primary font-mono text-sm">{item.token}</code>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

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
    </div>
  );
};

export default EditorSidebar;
