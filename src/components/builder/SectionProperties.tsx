import { BuilderSection, FONT_SIZES, FONT_WEIGHTS, TEXT_ALIGNS, PADDING_OPTIONS, SectionContent, SectionStyle } from "@/types/builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SectionPropertiesProps {
  section: BuilderSection;
  onUpdate: (section: BuilderSection) => void;
  onClose: () => void;
}

const SectionProperties = ({ section, onUpdate, onClose }: SectionPropertiesProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const updateContent = (updates: Partial<SectionContent>) => {
    onUpdate({ ...section, content: { ...section.content, ...updates } });
  };

  const updateStyle = (updates: Partial<SectionStyle>) => {
    onUpdate({ ...section, style: { ...section.style, ...updates } });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `builder/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('template-logos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('template-logos').getPublicUrl(path);
      updateContent({ [field]: publicUrl });
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addFormField = () => {
    const fields = [...(section.content.formFields || []), 'New Field'];
    updateContent({ formFields: fields });
  };

  const updateFormField = (index: number, value: string) => {
    const fields = [...(section.content.formFields || [])];
    fields[index] = value;
    updateContent({ formFields: fields });
  };

  const removeFormField = (index: number) => {
    const fields = (section.content.formFields || []).filter((_, i) => i !== index);
    updateContent({ formFields: fields });
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Section Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Content fields based on section type */}
          {(section.type === 'headline' || section.type === 'body') && (
            <div className="space-y-2">
              <Label>Text</Label>
              <Textarea
                value={section.content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                rows={section.type === 'body' ? 6 : 2}
                className="resize-none"
              />
            </div>
          )}

          {section.type === 'video' && (
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                value={section.content.videoUrl || ''}
                onChange={(e) => updateContent({ videoUrl: e.target.value })}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, or any direct video link
              </p>
            </div>
          )}

          {section.type === 'image' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Layout</Label>
                <Select value={section.content.imageLayout || 'single'} onValueChange={(v) => updateContent({ imageLayout: v as 'single' | 'row' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Image</SelectItem>
                    <SelectItem value="row">Row of Images</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(section.content.imageLayout || 'single') === 'single' ? (
                <>
                  <Label>Image</Label>
                  <Input
                    value={section.content.imageUrl || ''}
                    onChange={(e) => updateContent({ imageUrl: e.target.value })}
                    placeholder="Paste image URL"
                  />
                  <div className="relative">
                    <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageUpload(e, 'imageUrl')}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Label>Images ({(section.content.imageUrls || []).length})</Label>
                  {(section.content.imageUrls || []).map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => {
                          const urls = [...(section.content.imageUrls || [])];
                          urls[i] = e.target.value;
                          updateContent({ imageUrls: urls });
                        }}
                        placeholder="Image URL"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => {
                        const urls = (section.content.imageUrls || []).filter((_, idx) => idx !== i);
                        updateContent({ imageUrls: urls });
                      }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => {
                    updateContent({ imageUrls: [...(section.content.imageUrls || []), ''] });
                  }}>
                    <Plus className="w-3 h-3 mr-2" /> Add Image
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload & Add Image"}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const ext = file.name.split('.').pop();
                          const path = `builder/${Date.now()}.${ext}`;
                          const { error } = await supabase.storage.from('template-logos').upload(path, file);
                          if (error) throw error;
                          const { data: { publicUrl } } = supabase.storage.from('template-logos').getPublicUrl(path);
                          updateContent({ imageUrls: [...(section.content.imageUrls || []), publicUrl] });
                          toast({ title: "Image uploaded!" });
                        } catch (err: any) {
                          toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {section.type === 'banner' && (
            <>
              <div className="space-y-2">
                <Label>Banner Headline</Label>
                <Input
                  value={section.content.bannerText || ''}
                  onChange={(e) => updateContent({ bannerText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Subtext</Label>
                <Input
                  value={section.content.bannerSubtext || ''}
                  onChange={(e) => updateContent({ bannerSubtext: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Background Image</Label>
                <Input
                  value={section.content.imageUrl || ''}
                  onChange={(e) => updateContent({ imageUrl: e.target.value })}
                  placeholder="Paste image URL"
                />
                <div className="relative">
                  <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Background"}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, 'imageUrl')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Overlay Opacity</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(section.style.overlayOpacity || 0) * 100}
                  onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) / 100 })}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{Math.round((section.style.overlayOpacity || 0) * 100)}%</span>
              </div>
            </>
          )}

          {section.type === 'cta' && (
            <>
              <div className="space-y-2">
                <Label>Heading Text</Label>
                <Input
                  value={section.content.text || ''}
                  onChange={(e) => updateContent({ text: e.target.value })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Primary Button Text</Label>
                <Input
                  value={section.content.buttonText || ''}
                  onChange={(e) => updateContent({ buttonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Button Link</Label>
                <Input
                  value={section.content.buttonLink || ''}
                  onChange={(e) => updateContent({ buttonLink: e.target.value })}
                  placeholder="#section or https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Button Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                    <span className="text-xs text-muted-foreground font-mono">{section.style.buttonColor}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Button Text</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                    <span className="text-xs text-muted-foreground font-mono">{section.style.buttonTextColor}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Secondary Button Text</Label>
                <Input
                  value={section.content.secondaryButtonText || ''}
                  onChange={(e) => updateContent({ secondaryButtonText: e.target.value })}
                  placeholder="Leave empty to hide"
                />
              </div>
              {section.content.secondaryButtonText && (
                <div className="space-y-2">
                  <Label>Secondary Button Link</Label>
                  <Input
                    value={section.content.secondaryButtonLink || ''}
                    onChange={(e) => updateContent({ secondaryButtonLink: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          {section.type === 'form' && (
            <>
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  value={section.content.formTitle || ''}
                  onChange={(e) => updateContent({ formTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Form Subtitle</Label>
                <Input
                  value={section.content.formSubtitle || ''}
                  onChange={(e) => updateContent({ formSubtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Submit Button Text</Label>
                <Input
                  value={section.content.formButtonText || ''}
                  onChange={(e) => updateContent({ formButtonText: e.target.value })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Form Fields</Label>
                {(section.content.formFields || []).map((field, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={field} onChange={(e) => updateFormField(i, e.target.value)} className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => removeFormField(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFormField} className="w-full">
                  <Plus className="w-3 h-3 mr-2" />
                  Add Field
                </Button>
              </div>
            </>
          )}

          {section.type === 'logo' && (
            <div className="space-y-3">
              <Label>Logo</Label>
              <Input
                value={section.content.logoUrl || ''}
                onChange={(e) => updateContent({ logoUrl: e.target.value })}
                placeholder="Paste logo URL"
              />
              <div className="relative">
                <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Logo"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, 'logoUrl')}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo Height</Label>
                <Select value={section.style.height || '60px'} onValueChange={(v) => updateStyle({ height: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['32px', '40px', '48px', '60px', '80px', '100px'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {section.type === 'document' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Document Title</Label>
                <Input
                  value={section.content.documentTitle || ''}
                  onChange={(e) => updateContent({ documentTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={section.content.documentDescription || ''}
                  onChange={(e) => updateContent({ documentDescription: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Document URL</Label>
                <Input
                  value={section.content.documentUrl || ''}
                  onChange={(e) => updateContent({ documentUrl: e.target.value })}
                  placeholder="Paste document URL"
                />
              </div>
              <div className="relative">
                <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const ext = file.name.split('.').pop();
                      const path = `builder/docs/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage.from('template-logos').upload(path, file);
                      if (error) throw error;
                      const { data: { publicUrl } } = supabase.storage.from('template-logos').getPublicUrl(path);
                      updateContent({ documentUrl: publicUrl });
                      toast({ title: "Document uploaded!" });
                    } catch (err: any) {
                      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={section.content.documentButtonText || ''}
                  onChange={(e) => updateContent({ documentButtonText: e.target.value })}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Button Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Button Text</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {section.type === 'spacer' && (
            <div className="space-y-2">
              <Label>Height</Label>
              <Select value={section.style.height || '48px'} onValueChange={(v) => updateStyle({ height: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['16px', '24px', '32px', '48px', '64px', '80px', '96px', '128px'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Typography controls — shown for text-based sections */}
          {['headline', 'body', 'banner', 'cta'].includes(section.type) && (
            <>
              <Separator />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Font Size</Label>
                  <Select value={section.style.fontSize || '18px'} onValueChange={(v) => updateStyle({ fontSize: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Font Weight</Label>
                  <Select value={section.style.fontWeight || 'normal'} onValueChange={(v) => updateStyle({ fontWeight: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_WEIGHTS.map((w) => (
                        <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Text Align</Label>
                  <div className="flex gap-1">
                    {TEXT_ALIGNS.map((align) => (
                      <Button
                        key={align}
                        variant={section.style.textAlign === align ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStyle({ textAlign: align })}
                        className="flex-1"
                      >
                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={section.style.fontWeight === 'bold' || section.style.fontWeight === 'extrabold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStyle({ fontWeight: section.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  >
                    <Bold className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={section.style.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStyle({ fontStyle: section.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  >
                    <Italic className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Color controls — shown for all except spacer */}
          {section.type !== 'spacer' && (
            <>
              <Separator />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={section.style.backgroundColor || '#ffffff'}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={section.style.backgroundColor || '#ffffff'}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                {['headline', 'body', 'banner', 'cta', 'form'].includes(section.type) && (
                  <div className="space-y-1">
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={section.style.textColor || '#1a1a1a'}
                        onChange={(e) => updateStyle({ textColor: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input
                        value={section.style.textColor || '#1a1a1a'}
                        onChange={(e) => updateStyle({ textColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Spacing controls */}
          <Separator />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spacing</h4>
          <div className="space-y-2">
            <Label className="text-xs">Vertical Padding</Label>
            <Select value={section.style.paddingY || '32px'} onValueChange={(v) => updateStyle({ paddingY: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PADDING_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {['headline', 'body', 'video', 'image', 'form'].includes(section.type) && (
            <div className="space-y-2">
              <Label className="text-xs">Max Width</Label>
              <Select value={section.style.maxWidth || '100%'} onValueChange={(v) => updateStyle({ maxWidth: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['100%', '600px', '700px', '800px', '900px', '1000px', '1200px'].map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SectionProperties;
