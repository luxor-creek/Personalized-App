import { useState } from "react";
import { Video, Check, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditableVideoProps {
  videoId: string;
  thumbnailUrl?: string;
  onVideoChange: (videoId: string) => void;
  onThumbnailChange?: (thumbnailUrl: string) => void;
  className?: string;
}

const EditableVideo = ({
  videoId,
  thumbnailUrl,
  onVideoChange,
  onThumbnailChange,
  className,
}: EditableVideoProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editVideoId, setEditVideoId] = useState(videoId);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState(thumbnailUrl || "");

  const handleSave = () => {
    onVideoChange(editVideoId);
    if (onThumbnailChange) {
      onThumbnailChange(editThumbnailUrl);
    }
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setEditVideoId(videoId);
    setEditThumbnailUrl(thumbnailUrl || "");
    setIsDialogOpen(false);
  };

  // Extract video ID from various Vimeo URL formats
  const parseVimeoUrl = (input: string): string => {
    // Already just an ID
    if (/^\d+$/.test(input)) {
      return input;
    }
    
    // URL patterns
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return input;
  };

  const handleVideoIdChange = (value: string) => {
    setEditVideoId(parseVimeoUrl(value));
  };

  return (
    <>
      <div
        className={cn(
          "relative group cursor-pointer",
          className
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Edit overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-xl transition-all z-10 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
              <Video className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">Edit Video</span>
            </div>
          </div>
        </div>
        
        {/* Video preview */}
        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
            className="w-full h-full pointer-events-none"
            allow="fullscreen"
            title="Video preview"
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="videoId">Vimeo Video ID or URL</Label>
              <Input
                id="videoId"
                value={editVideoId}
                onChange={(e) => handleVideoIdChange(e.target.value)}
                placeholder="e.g., 1153753885 or https://vimeo.com/1153753885"
              />
              <p className="text-xs text-muted-foreground">
                Enter a Vimeo video ID or paste a full Vimeo URL
              </p>
            </div>

            {editVideoId && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={`https://player.vimeo.com/video/${editVideoId}?title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  allow="fullscreen"
                  title="Video preview"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Custom Thumbnail URL (optional)</Label>
              <Input
                id="thumbnailUrl"
                value={editThumbnailUrl}
                onChange={(e) => setEditThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use Vimeo's default thumbnail
              </p>
            </div>

            {editThumbnailUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={editThumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="w-4 h-4 mr-2" />
                Save Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableVideo;
