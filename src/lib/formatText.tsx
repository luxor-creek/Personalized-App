import React from "react";

/**
 * Shared text formatting utility for landing pages.
 * Parses and renders:
 * - Size markers: [[size:small]]text[[/size:small]]
 * - Color markers: [[color:primary]]text[[/color:primary]]
 * - Bold: **text**
 * - Italic: *text*
 * - Personalization tokens: {{first_name}}, {{company}}, etc.
 */

const SIZE_CLASSES: Record<string, string> = {
  small: "text-sm",
  large: "text-lg",
  xlarge: "text-xl",
  "2xlarge": "text-2xl",
};

const COLOR_MAP: Record<string, string> = {
  primary: "hsl(var(--primary))",
  muted: "#6b7280",
  destructive: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#8b5cf6",
  yellow: "#eab308",
  pink: "#ec4899",
  teal: "#14b8a6",
  indigo: "#6366f1",
  amber: "#f59e0b",
  white: "#ffffff",
};

/**
 * Recursively parse and render formatted text with all styling applied.
 */
export function renderFormattedText(text: string, keyPrefix = ""): React.ReactNode {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let key = 0;

  // Regex to match all format markers and tokens
  // Order matters: size, color, bold, italic, tokens
  const formatRegex = /(\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\2\]\]|\[\[color:([^\]]+)\]\](.+?)\[\[\/color:\4\]\]|\*\*(.+?)\*\*|\*(.+?)\*|{{[^}]+}})/g;

  let lastIndex = 0;
  let match;

  while ((match = formatRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(
        <span key={`${keyPrefix}${key++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    const fullMatch = match[0];

    // Size markers [[size:X]]...[[/size:X]]
    if (fullMatch.startsWith("[[size:")) {
      const sizeMatch = fullMatch.match(
        /\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\1\]\]/
      );
      if (sizeMatch) {
        elements.push(
          <span key={`${keyPrefix}${key++}`} className={SIZE_CLASSES[sizeMatch[1]]}>
            {renderFormattedText(sizeMatch[2], `${keyPrefix}${key}-`)}
          </span>
        );
      }
    }
    // Color markers [[color:X]]...[[/color:X]]
    else if (fullMatch.startsWith("[[color:")) {
      const colorMatch = fullMatch.match(
        /\[\[color:([^\]]+)\]\](.+?)\[\[\/color:\1\]\]/
      );
      if (colorMatch) {
        const colorValue = COLOR_MAP[colorMatch[1]] || colorMatch[1];
        elements.push(
          <span key={`${keyPrefix}${key++}`} style={{ color: colorValue }}>
            {renderFormattedText(colorMatch[2], `${keyPrefix}${key}-`)}
          </span>
        );
      }
    }
    // Bold **text**
    else if (fullMatch.startsWith("**") && fullMatch.endsWith("**")) {
      const innerText = fullMatch.slice(2, -2);
      elements.push(
        <strong key={`${keyPrefix}${key++}`} className="font-semibold text-foreground">
          {renderFormattedText(innerText, `${keyPrefix}${key}-`)}
        </strong>
      );
    }
    // Italic *text*
    else if (fullMatch.startsWith("*") && fullMatch.endsWith("*") && !fullMatch.startsWith("**")) {
      const innerText = fullMatch.slice(1, -1);
      elements.push(
        <em key={`${keyPrefix}${key++}`} className="italic text-primary">
          {renderFormattedText(innerText, `${keyPrefix}${key}-`)}
        </em>
      );
    }
    // Personalization tokens {{token}}
    else if (fullMatch.match(/{{[^}]+}}/)) {
      elements.push(
        <span key={`${keyPrefix}${key++}`} className="font-medium">
          {fullMatch}
        </span>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`${keyPrefix}${key++}`}>{text.substring(lastIndex)}</span>
    );
  }

  return elements.length > 0 ? elements : text;
}

/**
 * Apply personalization data to text containing {{tokens}}.
 * This replaces tokens BEFORE formatting is applied.
 */
export function applyPersonalization(
  text: string,
  data: {
    first_name?: string;
    last_name?: string;
    company?: string;
    full_name?: string;
  }
): string {
  if (!text) return text;
  
  return text
    .replace(/{{first_name}}/g, data.first_name || "")
    .replace(/{{last_name}}/g, data.last_name || "")
    .replace(/{{company}}/g, data.company || "")
    .replace(/{{full_name}}/g, data.full_name || "");
}

/**
 * Render text with personalization applied first, then formatting.
 */
export function renderPersonalizedFormattedText(
  text: string,
  personalizationData?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    full_name?: string;
  },
  keyPrefix = ""
): React.ReactNode {
  if (!text) return null;
  
  const personalizedText = personalizationData
    ? applyPersonalization(text, personalizationData)
    : text;
    
  return renderFormattedText(personalizedText, keyPrefix);
}
