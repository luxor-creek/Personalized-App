import { useState, useRef, useEffect } from "react";
import { Check, X, Type, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  fieldName: string;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  supportsPersonalization?: boolean;
  children?: React.ReactNode;
}

const PERSONALIZATION_TOKENS = [
  { token: "{{first_name}}", label: "First Name" },
  { token: "{{last_name}}", label: "Last Name" },
  { token: "{{company}}", label: "Company" },
  { token: "{{full_name}}", label: "Full Name" },
];

const EditableText = ({
  value,
  onChange,
  fieldName,
  className,
  multiline = false,
  placeholder = "Click to edit...",
  supportsPersonalization = false,
  children,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const insertToken = (token: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = editValue.substring(0, start) + token + editValue.substring(end);
      setEditValue(newValue);
      // Focus back to input
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    } else {
      setEditValue(editValue + token);
    }
  };

  // Highlight personalization tokens in display
  const renderDisplayValue = () => {
    if (!value) return <span className="text-muted-foreground italic">{placeholder}</span>;
    
    const parts = value.split(/({{[^}]+}})/g);
    return parts.map((part, index) => {
      if (part.match(/{{[^}]+}}/)) {
        return (
          <span 
            key={index} 
            className="bg-primary/20 text-primary px-1 rounded font-mono text-[0.85em]"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (isEditing) {
    return (
      <div className={cn("relative group", className)}>
        <div className="absolute -inset-2 bg-primary/10 rounded-lg border-2 border-primary border-dashed z-10" />
      <div className="relative z-20" style={{ color: '#111' }}>
          {multiline ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] bg-white text-gray-900 border-gray-300"
              placeholder={placeholder}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white text-gray-900 border-gray-300"
              placeholder={placeholder}
            />
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {supportsPersonalization && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      Insert Variable
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
                          onClick={() => insertToken(item.token)}
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
            
            <div className="flex items-center gap-1">
              <button
                className="h-7 w-7 p-0 inline-flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </button>
              <button
                className="h-7 w-7 p-0 inline-flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Editing: {fieldName}
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
      <div className="absolute -inset-1 bg-primary/0 group-hover:bg-primary/5 rounded-lg border border-transparent group-hover:border-primary/30 group-hover:border-dashed transition-all" />
      
      {/* Edit button */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
          <Type className="w-3 h-3" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {children || renderDisplayValue()}
      </div>
    </div>
  );
};

export default EditableText;
