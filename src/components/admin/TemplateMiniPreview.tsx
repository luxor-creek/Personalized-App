import { useEffect, useRef, useState } from "react";

interface TemplateMiniPreviewProps {
  slug: string;
  isBuilderTemplate?: boolean;
}

/**
 * Renders a real, scaled-down preview of a template inside a sandboxed iframe.
 * - Lazy-loads via IntersectionObserver (only when card is visible)
 * - pointer-events: none prevents interaction
 * - sandbox restricts scripts/forms/navigation for safety
 * - No tracking/analytics fire because preview=true is passed
 */
const TemplateMiniPreview = ({ slug, isBuilderTemplate }: TemplateMiniPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Lazy load: only mount iframe when card scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const previewUrl = isBuilderTemplate
    ? `/builder-preview/${slug}`
    : `/template-editor/${slug}?preview=true`;

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-muted">
      {isVisible && (
        <>
          {/* Scaled iframe: render at ~3x size then scale down to fit */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{ transform: "scale(0.35)", width: "286%", height: "286%" }}
          >
            <iframe
              src={previewUrl}
              title="Template preview"
              sandbox="allow-same-origin"
              loading="lazy"
              className="w-full h-full border-0"
              style={{ pointerEvents: "none" }}
              onLoad={() => setLoaded(true)}
            />
          </div>
          {/* Loading shimmer while iframe loads */}
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-xs text-muted-foreground">Loading preview…</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateMiniPreview;
