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

const COLOR_CLASSES: Record<string, string> = {
  primary: "text-primary",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
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
  const formatRegex = /(\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\2\]\]|\[\[color:(primary|muted|destructive)\]\](.+?)\[\[\/color:\4\]\]|\*\*(.+?)\*\*|\*(.+?)\*|{{[^}]+}})/g;

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
        /\[\[color:(primary|muted|destructive)\]\](.+?)\[\[\/color:\1\]\]/
      );
      if (colorMatch) {
        elements.push(
          <span key={`${keyPrefix}${key++}`} className={COLOR_CLASSES[colorMatch[1]]}>
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
        <span key={`${keyPrefix}${key++}`} className="text-primary font-medium">
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
