import { useState, useRef } from "react";
import { Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditableImageProps {
  src: string;
  alt: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  fieldName?: string;
  /** Pass a template ID to enable file uploads to storage */
  templateId?: string;
}

const EditableImage = ({
  src,
  alt,
  onImageChange,
  className,
  fieldName = "Image",
  templateId,
}: EditableImageProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveUrl = () => {
    if (editImageUrl.trim()) {
      onImageChange(editImageUrl.trim());
    }
    closeDialog();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to storage
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const folder = templateId || "general";
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("template-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("template-images")
        .getPublicUrl(path);

      onImageChange(urlData.publicUrl);
      toast({ title: "Image uploaded!" });
      closeDialog();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditImageUrl("");
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div
        className={cn("relative group cursor-pointer", className)}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all z-10 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
              <Upload className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">Replace Image</span>
            </div>
          </div>
        </div>
        <img src={src} alt={alt} className="w-full h-auto" />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace {fieldName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="rounded-lg overflow-hidden bg-muted border">
                <img src={src} alt={alt} className="w-full h-auto max-h-48 object-contain" />
              </div>
            </div>

            <Tabs defaultValue={templateId ? "upload" : "url"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 mt-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <div className="text-muted-foreground">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Uploading...</p>
                    </div>
                  ) : uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Click to select an image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">New Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/new-image.png"
                  />
                </div>

                {editImageUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="rounded-lg overflow-hidden bg-muted border">
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="w-full h-auto max-h-48 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={closeDialog}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUrl} disabled={!editImageUrl.trim()}>
                    <Check className="w-4 h-4 mr-2" />
                    Replace Image
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableImage;
