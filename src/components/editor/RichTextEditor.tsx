import { useState, useRef, useEffect, forwardRef } from "react";
import { Check, X, Bold, Italic, Type, Palette, AlignLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  fieldName: string;
  className?: string;
  placeholder?: string;
  supportsPersonalization?: boolean;
  isHeadline?: boolean;
}

const PERSONALIZATION_TOKENS = [
  { token: "{{first_name}}", label: "First Name" },
  { token: "{{last_name}}", label: "Last Name" },
  { token: "{{company}}", label: "Company" },
  { token: "{{full_name}}", label: "Full Name" },
];

const FONT_SIZES = [
  { value: "small", label: "Small", marker: "[[size:small]]" },
  { value: "normal", label: "Normal", marker: "" },
  { value: "large", label: "Large", marker: "[[size:large]]" },
  { value: "xlarge", label: "X-Large", marker: "[[size:xlarge]]" },
  { value: "2xlarge", label: "2X-Large", marker: "[[size:2xlarge]]" },
];

const TEXT_COLORS = [
  { value: "default", label: "Default", color: "#1a1a2e", marker: "" },
  { value: "primary", label: "Orange", color: "#f97316", marker: "[[color:primary]]" },
  { value: "blue", label: "Blue", color: "#3b82f6", marker: "[[color:blue]]" },
  { value: "green", label: "Green", color: "#22c55e", marker: "[[color:green]]" },
  { value: "red", label: "Red", color: "#ef4444", marker: "[[color:red]]" },
  { value: "purple", label: "Purple", color: "#8b5cf6", marker: "[[color:purple]]" },
  { value: "yellow", label: "Yellow", color: "#eab308", marker: "[[color:yellow]]" },
  { value: "pink", label: "Pink", color: "#ec4899", marker: "[[color:pink]]" },
  { value: "teal", label: "Teal", color: "#14b8a6", marker: "[[color:teal]]" },
  { value: "indigo", label: "Indigo", color: "#6366f1", marker: "[[color:indigo]]" },
  { value: "amber", label: "Amber", color: "#f59e0b", marker: "[[color:amber]]" },
  { value: "muted", label: "Muted", color: "#6b7280", marker: "[[color:muted]]" },
  { value: "white", label: "White", color: "#ffffff", marker: "[[color:white]]" },
];

const ColorPickerPopover = ({ onSelectColor, onSelectCustomColor }: { onSelectColor: (marker: string) => void; onSelectCustomColor: (hex: string) => void }) => {
  const [customHex, setCustomHex] = useState("#");
  
  const handleCustomApply = () => {
    const hex = customHex.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(hex)) {
      onSelectCustomColor(hex);
      setCustomHex("#");
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3">
        <Palette className="w-4 h-4 mr-1" />
        Color
        <ChevronDown className="w-3 h-3 ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {TEXT_COLORS.filter(c => c.marker).map((color) => (
            <button
              key={color.value}
              onClick={() => onSelectColor(color.marker)}
              className="w-7 h-7 rounded-full border border-border hover:scale-110 transition-transform relative group"
              style={{ backgroundColor: color.color }}
              title={color.label}
            >
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                {color.label}
              </span>
            </button>
          ))}
        </div>
        <div className="border-t pt-2 mt-1">
          <label className="text-xs text-muted-foreground mb-1 block">Custom hex color</label>
          <div className="flex gap-1.5">
            <div className="flex items-center gap-1.5 flex-1">
              <div 
                className="w-7 h-7 rounded border border-border flex-shrink-0" 
                style={{ backgroundColor: /^#[0-9a-fA-F]{3,8}$/.test(customHex) ? customHex : '#ccc' }} 
              />
              <Input
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#ff6600"
                className="h-7 text-xs font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomApply()}
              />
            </div>
            <Button size="sm" className="h-7 px-2 text-xs" onClick={handleCustomApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const RichTextEditor = ({
  value,
  onChange,
  fieldName,
  className,
  placeholder = "Click to edit...",
  supportsPersonalization = false,
  isHeadline = false,
}: RichTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editValue when value prop changes (from database load or external update)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || "");
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    // Ctrl/Cmd + Enter to save
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = editValue.substring(0, start) + text + editValue.substring(end);
      setEditValue(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editValue.substring(start, end);
      const newValue = editValue.substring(0, start) + before + selectedText + after + editValue.substring(end);
      setEditValue(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    }
  };

  const applyFormatMarker = (marker: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editValue.substring(start, end);
      if (selectedText) {
        const closeMarker = marker.replace("[[", "[[/");
        const newValue = editValue.substring(0, start) + marker + selectedText + closeMarker + editValue.substring(end);
        setEditValue(newValue);
      }
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };

  const applyCustomColor = (hex: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editValue.substring(start, end);
      if (selectedText) {
        const newValue = editValue.substring(0, start) + `[[color:${hex}]]` + selectedText + `[[/color:${hex}]]` + editValue.substring(end);
        setEditValue(newValue);
      }
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Parse and render formatted content with size, color, bold, italic
  const renderFormattedContent = () => {
    if (!value) return <span className="text-muted-foreground italic">{placeholder}</span>;
    
    // For headlines, render inline without paragraph splitting
    if (isHeadline) {
      return <span>{renderFormattedText(value)}</span>;
    }
    
    // Split by double newlines for paragraphs
    const paragraphs = value.split('\n\n');
    
    return paragraphs.map((paragraph, paraIndex) => {
      return (
        <p key={paraIndex}>
          {paragraph.split('\n').map((line, i) => (
            <span key={i}>{renderFormattedText(line)}{i < paragraph.split('\n').length - 1 && <br />}</span>
          ))}
        </p>
      );
    });
  };

  // Render text with all formatting applied
  const renderFormattedText = (text: string): React.ReactNode => {
    // Process markers in order: size, color, bold, italic, tokens
    const elements: React.ReactNode[] = [];
    let key = 0;

    // Regex to match all format markers and tokens
    const formatRegex = /(\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\2\]\]|\[\[color:([^\]]+)\]\](.+?)\[\[\/color:\4\]\]|\*\*(.+?)\*\*|\*(.+?)\*|{{[^}]+}})/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      
      const fullMatch = match[0];
      
      // Size markers
      if (fullMatch.startsWith('[[size:')) {
        const sizeMatch = fullMatch.match(/\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\1\]\]/);
        if (sizeMatch) {
          const sizeClasses: Record<string, string> = {
            small: 'text-sm',
            large: 'text-lg',
            xlarge: 'text-xl',
            '2xlarge': 'text-2xl'
          };
          elements.push(
            <span key={key++} className={sizeClasses[sizeMatch[1]]}>
              {renderFormattedText(sizeMatch[2])}
            </span>
          );
        }
      }
      // Color markers (named or hex)
      else if (fullMatch.startsWith('[[color:')) {
        const colorMatch = fullMatch.match(/\[\[color:([^\]]+)\]\](.+?)\[\[\/color:\1\]\]/);
        if (colorMatch) {
          const namedColors: Record<string, string> = {
            primary: '#f97316', muted: '#6b7280', destructive: '#ef4444',
            blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#8b5cf6',
            yellow: '#eab308', pink: '#ec4899', teal: '#14b8a6', indigo: '#6366f1',
            amber: '#f59e0b', white: '#ffffff',
          };
          const colorValue = namedColors[colorMatch[1]] || colorMatch[1];
          elements.push(
            <span key={key++} style={{ color: colorValue }}>
              {renderFormattedText(colorMatch[2])}
            </span>
          );
        }
      }
      // Bold
      else if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
        const innerText = fullMatch.slice(2, -2);
        elements.push(
          <strong key={key++} className="font-semibold">
            {renderFormattedText(innerText)}
          </strong>
        );
      }
      // Italic
      else if (fullMatch.startsWith('*') && fullMatch.endsWith('*')) {
        const innerText = fullMatch.slice(1, -1);
        elements.push(
          <em key={key++} className="italic">
            {renderFormattedText(innerText)}
          </em>
        );
      }
      // Personalization tokens
      else if (fullMatch.match(/{{[^}]+}}/)) {
        elements.push(
          <span 
            key={key++} 
            className="bg-primary/20 text-primary px-1 rounded font-mono text-[0.85em]"
          >
            {fullMatch}
          </span>
        );
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  if (isEditing) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute -inset-2 bg-primary/10 rounded-lg border-2 border-primary border-dashed z-10" />
        <div className="relative z-20 bg-white text-gray-900 rounded-lg shadow-lg p-4" style={{ color: '#111' }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-gray-200">
            <button
              type="button"
              className="inline-flex items-center justify-center h-8 px-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => wrapSelection('**', '**')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center h-8 px-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => wrapSelection('*', '*')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Font Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3">
                <Type className="w-4 h-4 mr-1" />
                Size
                <ChevronDown className="w-3 h-3 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {FONT_SIZES.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => size.marker && applyFormatMarker(size.marker)}
                    className="text-sm"
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Color Picker */}
            <ColorPickerPopover 
              onSelectColor={(marker) => applyFormatMarker(marker)}
              onSelectCustomColor={(hex) => applyCustomColor(hex)}
            />
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {supportsPersonalization && (
              <Popover>
                <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3">
                  <Type className="w-4 h-4 mr-1" />
                  Variable
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    {PERSONALIZATION_TOKENS.map((item) => (
                      <Button
                        key={item.token}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7"
                        onClick={() => insertAtCursor(item.token)}
                      >
                        <code className="text-primary mr-2">{item.token}</code>
                        <span className="text-muted-foreground">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[200px] p-3 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            placeholder={placeholder}
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Editing: {fieldName} | <kbd className="bg-gray-100 text-gray-700 px-1 rounded">Ctrl+Enter</kbd> to save
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center h-8 px-3 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center h-8 px-3 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {/* Edit indicator - force visible colors for contrast on dark backgrounds */}
      <div className="absolute -inset-2 bg-white/0 group-hover:bg-white/10 rounded-lg border border-transparent group-hover:border-white/50 group-hover:border-dashed transition-all" />
      
      {/* Edit button */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
          <AlignLeft className="w-3 h-3" />
        </div>
      </div>
      
      {/* Content - inherit color from parent */}
      <div className="relative">
        {renderFormattedContent()}
      </div>
    </div>
  );
};

export default RichTextEditor;
