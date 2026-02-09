import { BuilderSection, FONT_SIZES, FONT_WEIGHTS, TEXT_ALIGNS, PADDING_OPTIONS, SectionContent, SectionStyle, FeatureItem, TestimonialItem, PricingTier, FaqItem, StatItem, TeamMember, ComparisonRow, StepItem, FooterColumn, SocialProofItem, CardItem } from "@/types/builder";
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
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
      toast({ title: "Uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Only allow image uploads
    if (!file.type.startsWith('image/')) {
      toast({ title: "Only images can be uploaded", description: "For documents and videos, paste a shared link instead.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `builder/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('template-logos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('template-logos').getPublicUrl(path);
      updateContent({ [field]: publicUrl });
      toast({ title: "Uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const UploadButton = ({ label, field }: { label: string; field: string }) => (
    <div className="relative">
      <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Uploading..." : label}
      </Button>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, field)} />
    </div>
  );


  const renderArrayEditor = <T extends Record<string, any>>(
    items: T[],
    updateKey: string,
    fields: { key: keyof T; label: string; type?: 'text' | 'textarea' }[],
    defaultItem: T
  ) => (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 relative">
          <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {
            const updated = items.filter((_, idx) => idx !== i);
            updateContent({ [updateKey]: updated });
          }}>
            <Trash2 className="w-3 h-3" />
          </Button>
          {fields.map(({ key, label, type }) => (
            <div key={String(key)} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              {type === 'textarea' ? (
                <Textarea value={String(item[key] || '')} onChange={(e) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], [key]: e.target.value };
                  updateContent({ [updateKey]: updated });
                }} rows={2} className="resize-none text-xs" />
              ) : (
                <Input value={String(item[key] || '')} onChange={(e) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], [key]: e.target.value };
                  updateContent({ [updateKey]: updated });
                }} className="text-xs" />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ [updateKey]: [...items, defaultItem] })}>
        <Plus className="w-3 h-3 mr-2" /> Add Item
      </Button>
    </div>
  );

  const renderContentFields = () => {
    switch (section.type) {
      case 'headline':
      case 'body':
        return (
          <div className="space-y-2">
            <Label>Text</Label>
            <Textarea value={section.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} rows={section.type === 'body' ? 6 : 2} className="resize-none" />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input value={section.content.videoUrl || ''} onChange={(e) => updateContent({ videoUrl: e.target.value })} placeholder="YouTube, Vimeo, or direct video URL" />
            <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, or any direct video link</p>
          </div>
        );

      case 'image':
        return (
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
                <Input value={section.content.imageUrl || ''} onChange={(e) => updateContent({ imageUrl: e.target.value })} placeholder="Paste image URL" />
                <UploadButton label="Upload Image" field="imageUrl" />
              </>
            ) : (
              <>
                <Label>Images ({(section.content.imageUrls || []).length})</Label>
                {(section.content.imageUrls || []).map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={url} onChange={(e) => { const urls = [...(section.content.imageUrls || [])]; urls[i] = e.target.value; updateContent({ imageUrls: urls }); }} placeholder="Image URL" className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => updateContent({ imageUrls: (section.content.imageUrls || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ imageUrls: [...(section.content.imageUrls || []), ''] })}><Plus className="w-3 h-3 mr-2" /> Add Image</Button>
              </>
            )}
          </div>
        );

      case 'banner':
        return (
          <>
            <div className="space-y-2"><Label>Headline</Label><Input value={section.content.bannerText || ''} onChange={(e) => updateContent({ bannerText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtext</Label><Input value={section.content.bannerSubtext || ''} onChange={(e) => updateContent({ bannerSubtext: e.target.value })} /></div>
            <div className="space-y-2"><Label>Background Image</Label><Input value={section.content.imageUrl || ''} onChange={(e) => updateContent({ imageUrl: e.target.value })} placeholder="Paste image URL" /><UploadButton label="Upload Background" field="imageUrl" /></div>
            <div className="space-y-2">
              <Label>Overlay Opacity</Label>
              <input type="range" min="0" max="100" value={(section.style.overlayOpacity || 0) * 100} onChange={(e) => updateStyle({ overlayOpacity: parseInt(e.target.value) / 100 })} className="w-full" />
              <span className="text-xs text-muted-foreground">{Math.round((section.style.overlayOpacity || 0) * 100)}%</span>
            </div>
          </>
        );

      case 'cta':
        return (
          <>
            <div className="space-y-2"><Label>Heading</Label><Input value={section.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} /></div>
            <Separator />
            <div className="space-y-2"><Label>Primary Button Text</Label><Input value={section.content.buttonText || ''} onChange={(e) => updateContent({ buttonText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Primary Button Link</Label><Input value={section.content.buttonLink || ''} onChange={(e) => updateContent({ buttonLink: e.target.value })} placeholder="#section or https://..." /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Button Color</Label><input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
              <div className="space-y-1"><Label className="text-xs">Button Text</Label><input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
            </div>
            <Separator />
            <div className="space-y-2"><Label>Secondary Button</Label><Input value={section.content.secondaryButtonText || ''} onChange={(e) => updateContent({ secondaryButtonText: e.target.value })} placeholder="Leave empty to hide" /></div>
            {section.content.secondaryButtonText && <div className="space-y-2"><Label>Secondary Link</Label><Input value={section.content.secondaryButtonLink || ''} onChange={(e) => updateContent({ secondaryButtonLink: e.target.value })} /></div>}
          </>
        );

      case 'form':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.formTitle || ''} onChange={(e) => updateContent({ formTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.formSubtitle || ''} onChange={(e) => updateContent({ formSubtitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Button Text</Label><Input value={section.content.formButtonText || ''} onChange={(e) => updateContent({ formButtonText: e.target.value })} /></div>
            <Separator />
            <div className="space-y-2">
              <Label>Fields</Label>
              {(section.content.formFields || []).map((field, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={field} onChange={(e) => { const f = [...(section.content.formFields || [])]; f[i] = e.target.value; updateContent({ formFields: f }); }} className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => updateContent({ formFields: (section.content.formFields || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateContent({ formFields: [...(section.content.formFields || []), 'New Field'] })} className="w-full"><Plus className="w-3 h-3 mr-2" />Add Field</Button>
            </div>
          </>
        );

      case 'logo':
        return (
          <div className="space-y-3">
            <Label>Logo</Label>
            <Input value={section.content.logoUrl || ''} onChange={(e) => updateContent({ logoUrl: e.target.value })} placeholder="Paste logo URL" />
            <UploadButton label="Upload Logo" field="logoUrl" />
            <div className="space-y-2">
              <Label>Logo Height</Label>
              <Select value={section.style.height || '60px'} onValueChange={(v) => updateStyle({ height: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['32px', '40px', '48px', '60px', '80px', '100px'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-3">
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.documentTitle || ''} onChange={(e) => updateContent({ documentTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={section.content.documentDescription || ''} onChange={(e) => updateContent({ documentDescription: e.target.value })} rows={3} className="resize-none" /></div>
            <div className="space-y-2">
              <Label>Shared Link</Label>
              <Input value={section.content.documentUrl || ''} onChange={(e) => updateContent({ documentUrl: e.target.value })} placeholder="Dropbox, Google Drive, Box, or OneDrive link" />
              <p className="text-xs text-muted-foreground">Paste a shared link from Dropbox, Google Drive, Box, or OneDrive</p>
            </div>
            <div className="space-y-2"><Label>Button Text</Label><Input value={section.content.documentButtonText || ''} onChange={(e) => updateContent({ documentButtonText: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Btn Color</Label><input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
              <div className="space-y-1"><Label className="text-xs">Btn Text</Label><input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-2">
            <Label>Height</Label>
            <Select value={section.style.height || '48px'} onValueChange={(v) => updateStyle({ height: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['16px', '24px', '32px', '48px', '64px', '80px', '96px', '128px'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );

      // === NEW SECTIONS ===

      case 'hero':
        return (
          <>
            <div className="space-y-2"><Label>Badge</Label><Input value={section.content.heroBadge || ''} onChange={(e) => updateContent({ heroBadge: e.target.value })} placeholder="e.g. New, Beta" /></div>
            <div className="space-y-2"><Label>Headline</Label><Textarea value={section.content.text || ''} onChange={(e) => updateContent({ text: e.target.value })} rows={2} className="resize-none" /></div>
            <div className="space-y-2"><Label>Subheadline</Label><Textarea value={section.content.heroSubheadline || ''} onChange={(e) => updateContent({ heroSubheadline: e.target.value })} rows={2} className="resize-none" /></div>
            <Separator />
            <div className="space-y-2"><Label>Primary Button</Label><Input value={section.content.buttonText || ''} onChange={(e) => updateContent({ buttonText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Primary Link</Label><Input value={section.content.buttonLink || ''} onChange={(e) => updateContent({ buttonLink: e.target.value })} /></div>
            <div className="space-y-2"><Label>Secondary Button</Label><Input value={section.content.secondaryButtonText || ''} onChange={(e) => updateContent({ secondaryButtonText: e.target.value })} /></div>
            <Separator />
            <div className="space-y-2"><Label>Hero Image</Label><Input value={section.content.heroImageUrl || ''} onChange={(e) => updateContent({ heroImageUrl: e.target.value })} placeholder="Paste image URL" /><UploadButton label="Upload Image" field="heroImageUrl" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Btn Color</Label><input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
              <div className="space-y-1"><Label className="text-xs">Btn Text</Label><input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
            </div>
          </>
        );

      case 'features':
        return (
          <>
            <div className="space-y-1"><Label className="text-xs">Columns</Label>
              <Select value={String(section.style.columns || 3)} onValueChange={(v) => updateStyle({ columns: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['2', '3', '4'].map((c) => <SelectItem key={c} value={c}>{c} columns</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Separator />
            <Label>Features ({(section.content.featureItems || []).length})</Label>
            {renderArrayEditor<FeatureItem>(
              section.content.featureItems || [],
              'featureItems',
              [{ key: 'icon', label: 'Icon (emoji)' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
              { icon: '✨', title: 'New Feature', description: 'Description here' }
            )}
          </>
        );

      case 'testimonials':
        return (
          <>
            <Label>Testimonials ({(section.content.testimonialItems || []).length})</Label>
            {renderArrayEditor<TestimonialItem>(
              section.content.testimonialItems || [],
              'testimonialItems',
              [{ key: 'quote', label: 'Quote', type: 'textarea' }, { key: 'author', label: 'Author' }, { key: 'role', label: 'Role' }],
              { quote: 'Great product!', author: 'Name', role: 'Title' }
            )}
          </>
        );

      case 'pricing':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.pricingTitle || ''} onChange={(e) => updateContent({ pricingTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.pricingSubtitle || ''} onChange={(e) => updateContent({ pricingSubtitle: e.target.value })} /></div>
            <Separator />
            <Label>Tiers ({(section.content.pricingItems || []).length})</Label>
            {(section.content.pricingItems || []).map((tier, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 relative">
                <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => updateContent({ pricingItems: (section.content.pricingItems || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
                <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={tier.name} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], name: e.target.value }; updateContent({ pricingItems: t }); }} className="text-xs" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Price</Label><Input value={tier.price} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], price: e.target.value }; updateContent({ pricingItems: t }); }} className="text-xs" /></div>
                  <div className="space-y-1"><Label className="text-xs">Period</Label><Input value={tier.period || ''} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], period: e.target.value }; updateContent({ pricingItems: t }); }} className="text-xs" /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Features (one per line)</Label><Textarea value={tier.features.join('\n')} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], features: e.target.value.split('\n') }; updateContent({ pricingItems: t }); }} rows={3} className="resize-none text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Button Text</Label><Input value={tier.buttonText || ''} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], buttonText: e.target.value }; updateContent({ pricingItems: t }); }} className="text-xs" /></div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={tier.highlighted || false} onChange={(e) => { const t = [...(section.content.pricingItems || [])]; t[i] = { ...t[i], highlighted: e.target.checked }; updateContent({ pricingItems: t }); }} />Highlight this tier</label>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ pricingItems: [...(section.content.pricingItems || []), { name: 'Plan', price: '$0', period: '/mo', features: ['Feature 1'], buttonText: 'Choose' }] })}><Plus className="w-3 h-3 mr-2" />Add Tier</Button>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Btn Color</Label><input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
              <div className="space-y-1"><Label className="text-xs">Accent</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
            </div>
          </>
        );

      case 'faq':
        return (
          <>
            <Label>FAQ Items ({(section.content.faqItems || []).length})</Label>
            {renderArrayEditor<FaqItem>(
              section.content.faqItems || [],
              'faqItems',
              [{ key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'textarea' }],
              { question: 'New question?', answer: 'Answer here.' }
            )}
          </>
        );

      case 'stats':
        return (
          <>
            <Label>Stats ({(section.content.statItems || []).length})</Label>
            {renderArrayEditor<StatItem>(
              section.content.statItems || [],
              'statItems',
              [{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }],
              { value: '100+', label: 'Metric' }
            )}
            <div className="space-y-1"><Label className="text-xs">Accent Color</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'team':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.teamTitle || ''} onChange={(e) => updateContent({ teamTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.teamSubtitle || ''} onChange={(e) => updateContent({ teamSubtitle: e.target.value })} /></div>
            <Separator />
            <Label>Members ({(section.content.teamMembers || []).length})</Label>
            {renderArrayEditor<TeamMember>(
              section.content.teamMembers || [],
              'teamMembers',
              [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'imageUrl', label: 'Photo URL' }],
              { name: 'New Member', role: 'Role', imageUrl: '' }
            )}
          </>
        );

      case 'logoCloud':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.logoCloudTitle || ''} onChange={(e) => updateContent({ logoCloudTitle: e.target.value })} /></div>
            <Separator />
            <Label>Logos ({(section.content.logoUrls || []).length})</Label>
            {(section.content.logoUrls || []).map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input value={url} onChange={(e) => { const urls = [...(section.content.logoUrls || [])]; urls[i] = e.target.value; updateContent({ logoUrls: urls }); }} placeholder="Logo URL" className="flex-1 text-xs" />
                <Button variant="ghost" size="sm" onClick={() => updateContent({ logoUrls: (section.content.logoUrls || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ logoUrls: [...(section.content.logoUrls || []), ''] })}><Plus className="w-3 h-3 mr-2" />Add Logo</Button>
          </>
        );

      case 'newsletter':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.newsletterTitle || ''} onChange={(e) => updateContent({ newsletterTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.newsletterSubtitle || ''} onChange={(e) => updateContent({ newsletterSubtitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Placeholder</Label><Input value={section.content.newsletterPlaceholder || ''} onChange={(e) => updateContent({ newsletterPlaceholder: e.target.value })} /></div>
            <div className="space-y-2"><Label>Button Text</Label><Input value={section.content.newsletterButtonText || ''} onChange={(e) => updateContent({ newsletterButtonText: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Btn Color</Label><input type="color" value={section.style.buttonColor || '#6d54df'} onChange={(e) => updateStyle({ buttonColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
              <div className="space-y-1"><Label className="text-xs">Btn Text</Label><input type="color" value={section.style.buttonTextColor || '#ffffff'} onChange={(e) => updateStyle({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
            </div>
          </>
        );

      case 'comparison':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Header A</Label><Input value={section.content.comparisonHeaderA || ''} onChange={(e) => updateContent({ comparisonHeaderA: e.target.value })} className="text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">Header B</Label><Input value={section.content.comparisonHeaderB || ''} onChange={(e) => updateContent({ comparisonHeaderB: e.target.value })} className="text-xs" /></div>
            </div>
            <Separator />
            <Label>Rows ({(section.content.comparisonRows || []).length})</Label>
            {renderArrayEditor<ComparisonRow>(
              section.content.comparisonRows || [],
              'comparisonRows',
              [{ key: 'feature', label: 'Feature' }, { key: 'optionA', label: 'Option A' }, { key: 'optionB', label: 'Option B' }],
              { feature: 'Feature', optionA: '✓', optionB: '✗' }
            )}
          </>
        );

      case 'steps':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.stepsTitle || ''} onChange={(e) => updateContent({ stepsTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.stepsSubtitle || ''} onChange={(e) => updateContent({ stepsSubtitle: e.target.value })} /></div>
            <Separator />
            <Label>Steps ({(section.content.stepItems || []).length})</Label>
            {renderArrayEditor<StepItem>(
              section.content.stepItems || [],
              'stepItems',
              [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
              { title: 'Step', description: 'Description' }
            )}
            <div className="space-y-1"><Label className="text-xs">Accent Color</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'gallery':
        return (
          <>
            <div className="space-y-1"><Label className="text-xs">Columns</Label>
              <Select value={String(section.content.galleryColumns || 3)} onValueChange={(v) => updateContent({ galleryColumns: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['2', '3', '4'].map((c) => <SelectItem key={c} value={c}>{c} columns</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Separator />
            <Label>Images ({(section.content.galleryUrls || []).length})</Label>
            {(section.content.galleryUrls || []).map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input value={url} onChange={(e) => { const urls = [...(section.content.galleryUrls || [])]; urls[i] = e.target.value; updateContent({ galleryUrls: urls }); }} placeholder="Image URL" className="flex-1 text-xs" />
                <Button variant="ghost" size="sm" onClick={() => updateContent({ galleryUrls: (section.content.galleryUrls || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ galleryUrls: [...(section.content.galleryUrls || []), ''] })}><Plus className="w-3 h-3 mr-2" />Add Image</Button>
          </>
        );

      case 'footer':
        return (
          <>
            <Label>Columns ({(section.content.footerColumns || []).length})</Label>
            {(section.content.footerColumns || []).map((col, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 relative">
                <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => updateContent({ footerColumns: (section.content.footerColumns || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
                <div className="space-y-1"><Label className="text-xs">Column Title</Label><Input value={col.title} onChange={(e) => { const c = [...(section.content.footerColumns || [])]; c[i] = { ...c[i], title: e.target.value }; updateContent({ footerColumns: c }); }} className="text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Links (label|url, one per line)</Label>
                  <Textarea value={col.links.map(l => `${l.label}|${l.url}`).join('\n')} onChange={(e) => {
                    const c = [...(section.content.footerColumns || [])];
                    c[i] = { ...c[i], links: e.target.value.split('\n').filter(Boolean).map(line => { const [label, url] = line.split('|'); return { label: label || '', url: url || '#' }; }) };
                    updateContent({ footerColumns: c });
                  }} rows={3} className="resize-none text-xs" />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ footerColumns: [...(section.content.footerColumns || []), { title: 'Column', links: [{ label: 'Link', url: '#' }] }] })}><Plus className="w-3 h-3 mr-2" />Add Column</Button>
            <Separator />
            <div className="space-y-2"><Label>Copyright</Label><Input value={section.content.footerCopyright || ''} onChange={(e) => updateContent({ footerCopyright: e.target.value })} /></div>
          </>
        );

      case 'divider':
        return (
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={section.content.dividerStyle || 'solid'} onValueChange={(v) => updateContent({ dividerStyle: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-1"><Label className="text-xs">Color</Label><input type="color" value={section.style.accentColor || '#e2e8f0'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </div>
        );

      case 'quote':
        return (
          <>
            <div className="space-y-2"><Label>Quote</Label><Textarea value={section.content.quoteText || ''} onChange={(e) => updateContent({ quoteText: e.target.value })} rows={3} className="resize-none" /></div>
            <div className="space-y-2"><Label>Author</Label><Input value={section.content.quoteAuthor || ''} onChange={(e) => updateContent({ quoteAuthor: e.target.value })} /></div>
            <div className="space-y-2"><Label>Role</Label><Input value={section.content.quoteRole || ''} onChange={(e) => updateContent({ quoteRole: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Accent Color</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'countdown':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.countdownTitle || ''} onChange={(e) => updateContent({ countdownTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.countdownSubtitle || ''} onChange={(e) => updateContent({ countdownSubtitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={section.content.countdownDate || ''} onChange={(e) => updateContent({ countdownDate: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Accent Color</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'socialProof':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.socialProofTitle || ''} onChange={(e) => updateContent({ socialProofTitle: e.target.value })} /></div>
            <Separator />
            <Label>Items ({(section.content.socialProofItems || []).length})</Label>
            {renderArrayEditor<SocialProofItem>(
              section.content.socialProofItems || [],
              'socialProofItems',
              [{ key: 'count', label: 'Count/Value' }, { key: 'label', label: 'Label' }, { key: 'platform', label: 'Source' }],
              { platform: 'Source', count: '0', label: 'Label' }
            )}
            <div className="space-y-1"><Label className="text-xs">Accent Color</Label><input type="color" value={section.style.accentColor || '#6d54df'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'benefits':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={section.content.benefitsTitle || ''} onChange={(e) => updateContent({ benefitsTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Subtitle</Label><Input value={section.content.benefitsSubtitle || ''} onChange={(e) => updateContent({ benefitsSubtitle: e.target.value })} /></div>
            <Separator />
            <Label>Benefits ({(section.content.benefitItems || []).length})</Label>
            {(section.content.benefitItems || []).map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input value={item} onChange={(e) => { const items = [...(section.content.benefitItems || [])]; items[i] = e.target.value; updateContent({ benefitItems: items }); }} className="flex-1 text-xs" />
                <Button variant="ghost" size="sm" onClick={() => updateContent({ benefitItems: (section.content.benefitItems || []).filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateContent({ benefitItems: [...(section.content.benefitItems || []), 'New benefit'] })}><Plus className="w-3 h-3 mr-2" />Add Benefit</Button>
            <div className="space-y-1"><Label className="text-xs">Check Color</Label><input type="color" value={section.style.accentColor || '#22c55e'} onChange={(e) => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /></div>
          </>
        );

      case 'cards':
        return (
          <>
            <div className="space-y-2"><Label>Section Title</Label><Input value={section.content.cardsTitle || ''} onChange={(e) => updateContent({ cardsTitle: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Columns</Label>
              <Select value={String(section.style.columns || 3)} onValueChange={(v) => updateStyle({ columns: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['2', '3', '4'].map((c) => <SelectItem key={c} value={c}>{c} columns</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Separator />
            <Label>Cards ({(section.content.cardItems || []).length})</Label>
            {renderArrayEditor<CardItem>(
              section.content.cardItems || [],
              'cardItems',
              [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'imageUrl', label: 'Image URL' }],
              { title: 'Card', description: 'Description', imageUrl: '' }
            )}
          </>
        );

      default:
        return null;
    }
  };

  // Determine which sections show typography controls
  const textSections = ['headline', 'body', 'banner', 'cta', 'hero', 'quote'];
  const colorSections = section.type !== 'spacer';
  const maxWidthSections = ['headline', 'body', 'video', 'image', 'form', 'features', 'testimonials', 'pricing', 'faq', 'stats', 'team', 'steps', 'gallery', 'comparison', 'cards', 'benefits', 'socialProof', 'newsletter', 'document', 'quote', 'footer'];

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Section Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {renderContentFields()}

          {/* Typography */}
          {textSections.includes(section.type) && (
            <>
              <Separator />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h4>
              <div className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Font Size</Label>
                  <Select value={section.style.fontSize || '18px'} onValueChange={(v) => updateStyle({ fontSize: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Font Weight</Label>
                  <Select value={section.style.fontWeight || 'normal'} onValueChange={(v) => updateStyle({ fontWeight: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_WEIGHTS.map((w) => <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Text Align</Label>
                  <div className="flex gap-1">
                    {TEXT_ALIGNS.map((align) => (
                      <Button key={align} variant={section.style.textAlign === align ? 'default' : 'outline'} size="sm" onClick={() => updateStyle({ textAlign: align })} className="flex-1">
                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant={section.style.fontWeight === 'bold' || section.style.fontWeight === 'extrabold' ? 'default' : 'outline'} size="sm" onClick={() => updateStyle({ fontWeight: section.style.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold className="w-3 h-3" /></Button>
                  <Button variant={section.style.fontStyle === 'italic' ? 'default' : 'outline'} size="sm" onClick={() => updateStyle({ fontStyle: section.style.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic className="w-3 h-3" /></Button>
                </div>
              </div>
            </>
          )}

          {/* Colors */}
          {colorSections && (
            <>
              <Separator />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h4>
              <div className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Background</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={section.style.backgroundColor || '#ffffff'} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                    <Input value={section.style.backgroundColor || '#ffffff'} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} className="flex-1 font-mono text-xs" />
                  </div>
                </div>
                {['headline', 'body', 'banner', 'cta', 'form', 'hero', 'features', 'testimonials', 'pricing', 'faq', 'stats', 'team', 'steps', 'comparison', 'benefits', 'cards', 'socialProof', 'newsletter', 'quote', 'footer', 'document', 'countdown'].includes(section.type) && (
                  <div className="space-y-1"><Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={section.style.textColor || '#1a1a1a'} onChange={(e) => updateStyle({ textColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                      <Input value={section.style.textColor || '#1a1a1a'} onChange={(e) => updateStyle({ textColor: e.target.value })} className="flex-1 font-mono text-xs" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Spacing */}
          <Separator />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spacing</h4>
          <div className="space-y-2"><Label className="text-xs">Vertical Padding</Label>
            <Select value={section.style.paddingY || '32px'} onValueChange={(v) => updateStyle({ paddingY: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PADDING_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {maxWidthSections.includes(section.type) && (
            <div className="space-y-2"><Label className="text-xs">Max Width</Label>
              <Select value={section.style.maxWidth || '100%'} onValueChange={(v) => updateStyle({ maxWidth: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['100%', '600px', '700px', '800px', '900px', '1000px', '1100px', '1200px'].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SectionProperties;
