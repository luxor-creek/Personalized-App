import { Save, X, Eye, Settings, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  templateName: string;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
}

const EditorToolbar = ({
  templateName,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  onPreview,
}: EditorToolbarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="font-medium">Editing:</span>
            <span className="text-primary">{templateName}</span>
          </div>
          
          {hasChanges && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "bg-primary hover:bg-primary/90",
              !hasChanges && "opacity-50"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      
      {/* Instructions bar */}
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
        <span className="mr-4">
          💡 Click on any text or video to edit it
        </span>
        <span className="mr-4">
          📝 Use <code className="bg-gray-700 px-1 rounded">{"{{first_name}}"}</code> to insert personalization
        </span>
        <span>
          ⌨️ Press <kbd className="bg-gray-700 px-1 rounded">Esc</kbd> to cancel editing
        </span>
      </div>
    </div>
  );
};

export default EditorToolbar;
