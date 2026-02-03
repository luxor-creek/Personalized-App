import { useState, useRef, useEffect } from "react";
import { Check, X, Bold, Italic, Type, Palette, AlignLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { value: "default", label: "Default", color: "hsl(var(--foreground))", marker: "" },
  { value: "primary", label: "Primary (Gold)", color: "hsl(var(--primary))", marker: "[[color:primary]]" },
  { value: "muted", label: "Muted", color: "hsl(var(--muted-foreground))", marker: "[[color:muted]]" },
  { value: "destructive", label: "Red", color: "hsl(var(--destructive))", marker: "[[color:destructive]]" },
];

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
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

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
        // Wrap selection with marker
        const newValue = editValue.substring(0, start) + marker + selectedText + marker.replace("[[", "[[/") + editValue.substring(end);
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
    let processed = text;
    const elements: React.ReactNode[] = [];
    let key = 0;

    // Regex to match all format markers and tokens
    const formatRegex = /(\[\[size:(small|large|xlarge|2xlarge)\]\](.+?)\[\[\/size:\2\]\]|\[\[color:(primary|muted|destructive)\]\](.+?)\[\[\/color:\4\]\]|\*\*(.+?)\*\*|\*(.+?)\*|{{[^}]+}})/g;
    
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
      // Color markers
      else if (fullMatch.startsWith('[[color:')) {
        const colorMatch = fullMatch.match(/\[\[color:(primary|muted|destructive)\]\](.+?)\[\[\/color:\1\]\]/);
        if (colorMatch) {
          const colorClasses: Record<string, string> = {
            primary: 'text-primary',
            muted: 'text-muted-foreground',
            destructive: 'text-destructive'
          };
          elements.push(
            <span key={key++} className={colorClasses[colorMatch[1]]}>
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
        <div className="relative z-20 bg-white rounded-lg shadow-lg p-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => wrapSelection('**', '**')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => wrapSelection('*', '*')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />

            {/* Font Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Type className="w-4 h-4 mr-1" />
                  Size
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
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

            {/* Color Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Palette className="w-4 h-4 mr-1" />
                  Color
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {TEXT_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => color.marker && applyFormatMarker(color.marker)}
                    className="text-sm flex items-center gap-2"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-border" 
                      style={{ backgroundColor: color.color }}
                    />
                    {color.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {supportsPersonalization && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Type className="w-4 h-4 mr-1" />
                    Variable
                  </Button>
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
            className="w-full min-h-[200px] p-3 text-base border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={placeholder}
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Editing: {fieldName} | <kbd className="bg-muted px-1 rounded">Ctrl+Enter</kbd> to save
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
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
      {/* Edit indicator */}
      <div className="absolute -inset-2 bg-primary/0 group-hover:bg-primary/5 rounded-lg border border-transparent group-hover:border-primary/30 group-hover:border-dashed transition-all" />
      
      {/* Edit button */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
          <AlignLeft className="w-3 h-3" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {renderFormattedContent()}
      </div>
    </div>
  );
};

export default RichTextEditor;
