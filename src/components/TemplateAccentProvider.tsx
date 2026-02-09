import { useMemo } from "react";

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
  const style = useMemo(() => {
    if (!accentColor) return undefined;
    return {
      "--primary": accentColor,
      "--accent": accentColor,
      "--ring": accentColor,
    } as React.CSSProperties;
  }, [accentColor]);

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};

export default TemplateAccentProvider;
