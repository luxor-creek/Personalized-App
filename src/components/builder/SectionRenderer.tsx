import { BuilderSection } from "@/types/builder";

interface SectionRendererProps {
  section: BuilderSection;
  isSelected?: boolean;
  onClick?: () => void;
  isPreview?: boolean;
  personalization?: Record<string, string>;
}

const applyPersonalization = (text: string | undefined, personalization?: Record<string, string>) => {
  if (!text || !personalization) return text || '';
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => personalization[key] || `{{${key}}}`);
};

const parseVideoUrl = (url: string): string | null => {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0`;
  // Pure numeric (legacy Vimeo ID)
  if (/^\d+$/.test(url)) return `https://player.vimeo.com/video/${url}?badge=0&autopause=0`;
  // Direct URL (assume embeddable)
  if (url.startsWith('http')) return url;
  return null;
};

const SectionRenderer = ({ section, isSelected, onClick, isPreview, personalization }: SectionRendererProps) => {
  const { type, content, style } = section;

  const containerStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    paddingTop: style.paddingY,
    paddingBottom: style.paddingY,
    paddingLeft: style.paddingX || '24px',
    paddingRight: style.paddingX || '24px',
  };

  const textStyle: React.CSSProperties = {
    color: style.textColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight as any,
    fontStyle: style.fontStyle,
    textAlign: style.textAlign as any,
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: style.maxWidth || '100%',
    margin: '0 auto',
  };

  const wrapperClasses = `relative transition-all ${
    !isPreview ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-primary/30' : ''
  } ${isSelected ? 'outline outline-2 outline-primary ring-2 ring-primary/20' : ''}`;

  const renderContent = () => {
    switch (type) {
      case 'headline':
        return (
          <div style={containerStyle}>
            <h2 style={{ ...textStyle, ...innerStyle, lineHeight: 1.2 }}>
              {applyPersonalization(content.text, personalization)}
            </h2>
          </div>
        );

      case 'body':
        return (
          <div style={containerStyle}>
            <p style={{ ...textStyle, ...innerStyle, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {applyPersonalization(content.text, personalization)}
            </p>
          </div>
        );

      case 'video': {
        const embedUrl = parseVideoUrl(content.videoUrl || content.videoId || '');
        return (
          <div style={containerStyle}>
            <div style={innerStyle}>
              {embedUrl ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Video"
                  />
                </div>
              ) : (
                <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Paste a YouTube, Vimeo, or video URL in properties
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'image': {
        const layout = content.imageLayout || 'single';
        const hasRow = layout === 'row' && (content.imageUrls || []).length > 0;
        const hasSingle = layout === 'single' && content.imageUrl;
        return (
          <div style={containerStyle}>
            <div style={innerStyle}>
              {hasSingle && (
                <img
                  src={content.imageUrl}
                  alt=""
                  className="w-full rounded-lg object-cover"
                  style={{ borderRadius: style.borderRadius }}
                />
              )}
              {hasRow && (
                <div className="flex gap-4 overflow-x-auto">
                  {(content.imageUrls || []).filter(Boolean).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="rounded-lg object-cover flex-shrink-0"
                      style={{ borderRadius: style.borderRadius, height: '240px' }}
                    />
                  ))}
                </div>
              )}
              {!hasSingle && !hasRow && (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Upload or paste an image URL
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'banner':
        return (
          <div style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}>
            {content.imageUrl && (
              <>
                <img
                  src={content.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: style.overlayColor, opacity: style.overlayOpacity }}
                />
              </>
            )}
            <div style={{ position: 'relative', zIndex: 1, ...innerStyle }} className="text-center">
              <h2 style={{ ...textStyle, lineHeight: 1.2, marginBottom: '16px' }}>
                {applyPersonalization(content.bannerText, personalization)}
              </h2>
              {content.bannerSubtext && (
                <p style={{ color: style.textColor, opacity: 0.85, fontSize: '18px' }}>
                  {applyPersonalization(content.bannerSubtext, personalization)}
                </p>
              )}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div style={containerStyle}>
            <div style={innerStyle} className="text-center">
              <h2 style={{ ...textStyle, lineHeight: 1.2, marginBottom: '32px' }}>
                {applyPersonalization(content.text, personalization)}
              </h2>
              <div className="flex gap-4 justify-center flex-wrap">
                {content.buttonText && (
                  <a
                    href={content.buttonLink || '#'}
                    className="inline-flex items-center justify-center rounded-lg px-8 py-3 font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: style.buttonColor, color: style.buttonTextColor }}
                  >
                    {content.buttonText}
                  </a>
                )}
                {content.secondaryButtonText && (
                  <a
                    href={content.secondaryButtonLink || '#'}
                    className="inline-flex items-center justify-center rounded-lg px-8 py-3 font-semibold border-2 transition-all hover:opacity-90"
                    style={{
                      backgroundColor: style.secondaryButtonColor,
                      color: style.secondaryButtonTextColor,
                      borderColor: style.secondaryButtonTextColor,
                    }}
                  >
                    {content.secondaryButtonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div style={containerStyle}>
            <div style={{ ...innerStyle, maxWidth: style.maxWidth || '600px' }}>
              {content.formTitle && (
                <h3 style={{ ...textStyle, fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                  {applyPersonalization(content.formTitle, personalization)}
                </h3>
              )}
              {content.formSubtitle && (
                <p style={{ color: style.textColor, opacity: 0.7, textAlign: 'center', marginBottom: '24px', fontSize: '16px' }}>
                  {applyPersonalization(content.formSubtitle, personalization)}
                </p>
              )}
              <div className="space-y-4">
                {(content.formFields || []).map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1" style={{ color: style.textColor }}>{field}</label>
                    {field.toLowerCase() === 'message' ? (
                      <textarea
                        className="w-full border rounded-lg px-4 py-3 bg-transparent resize-none"
                        rows={4}
                        placeholder={`Enter ${field.toLowerCase()}`}
                        style={{ borderColor: style.textColor + '30', color: style.textColor }}
                        disabled={isPreview}
                      />
                    ) : (
                      <input
                        type={field.toLowerCase().includes('email') ? 'email' : 'text'}
                        className="w-full border rounded-lg px-4 py-3 bg-transparent"
                        placeholder={`Enter ${field.toLowerCase()}`}
                        style={{ borderColor: style.textColor + '30', color: style.textColor }}
                        disabled={isPreview}
                      />
                    )}
                  </div>
                ))}
                <button
                  className="w-full rounded-lg px-8 py-3 font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: style.buttonColor, color: style.buttonTextColor }}
                  disabled={isPreview}
                >
                  {content.formButtonText || 'Submit'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'logo':
        return (
          <div style={{ ...containerStyle, paddingTop: '16px', paddingBottom: '16px' }}>
            <div style={{ maxWidth: style.maxWidth || '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
              {content.logoUrl ? (
                <img
                  src={content.logoUrl}
                  alt="Logo"
                  style={{ height: style.height || '40px' }}
                  className="object-contain"
                />
              ) : (
                <div className="h-10 w-36 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                  Upload a logo
                </div>
              )}
            </div>
          </div>
        );

      case 'document':
        return (
          <div style={containerStyle}>
            <div style={{ ...innerStyle, maxWidth: style.maxWidth || '700px', textAlign: 'center' }}>
              {content.documentTitle && (
                <h3 style={{ ...textStyle, fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {applyPersonalization(content.documentTitle, personalization)}
                </h3>
              )}
              {content.documentDescription && (
                <p style={{ color: style.textColor, opacity: 0.7, marginBottom: '24px', fontSize: '16px' }}>
                  {applyPersonalization(content.documentDescription, personalization)}
                </p>
              )}
              <a
                href={content.documentUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: style.buttonColor, color: style.buttonTextColor }}
                onClick={(e) => !content.documentUrl && e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {content.documentButtonText || 'Download PDF'}
              </a>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div style={{ backgroundColor: style.backgroundColor, height: style.height || '48px' }} />
        );

      default:
        return null;
    }
  };

  return (
    <div className={wrapperClasses} onClick={onClick}>
      {renderContent()}
      {isSelected && !isPreview && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium z-10">
          {type}
        </div>
      )}
    </div>
  );
};

export default SectionRenderer;
