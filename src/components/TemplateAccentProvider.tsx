import { useEffect } from "react";

interface TemplateAccentProviderProps {
  accentColor?: string | null;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps template pages and overrides --primary CSS variable
 * so each template can have its own accent color independent of the app's purple theme.
 * accentColor should be an HSL string like "24 95% 53%" (orange) or null for default.
 */
const TemplateAccentProvider = ({ accentColor, children, className }: TemplateAccentProviderProps) => {
  useEffect(() => {
    if (!accentColor) return;

    const root = document.documentElement;
    const prev = {
      primary: root.style.getPropertyValue("--primary"),
      primaryForeground: root.style.getPropertyValue("--primary-foreground"),
      accent: root.style.getPropertyValue("--accent"),
      ring: root.style.getPropertyValue("--ring"),
    };

    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--ring", accentColor);

    return () => {
      // Restore originals on unmount
      if (prev.primary) root.style.setProperty("--primary", prev.primary);
      else root.style.removeProperty("--primary");
      if (prev.primaryForeground) root.style.setProperty("--primary-foreground", prev.primaryForeground);
      else root.style.removeProperty("--primary-foreground");
      if (prev.accent) root.style.setProperty("--accent", prev.accent);
      else root.style.removeProperty("--accent");
      if (prev.ring) root.style.setProperty("--ring", prev.ring);
      else root.style.removeProperty("--ring");
    };
  }, [accentColor]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default TemplateAccentProvider;
