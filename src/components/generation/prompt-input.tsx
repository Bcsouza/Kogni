"use client";

import { useState } from "react";
import { Sparkles, ArrowUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onEnhance?: () => void;
  isEnhancing?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
  className?: string;
  minRows?: number;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onEnhance,
  isEnhancing,
  isGenerating,
  placeholder = "Describe what you want to create...",
  className,
  minRows = 3,
}: PromptInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card shadow-sm transition-colors",
        focused ? "border-brand/50 ring-2 ring-brand/20" : "border-border",
        className,
      )}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        rows={minRows}
        className="min-h-[unset] resize-none border-0 bg-transparent px-4 pt-4 pb-14 text-base shadow-none focus-visible:ring-0"
      />
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {onEnhance && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={onEnhance}
              disabled={isEnhancing || !value.trim()}
            >
              <Wand2 className={cn("size-3.5", isEnhancing && "animate-pulse")} />
              {isEnhancing ? "Enhancing…" : "Enhance"}
            </Button>
          )}
        </div>
        <Button
          type="button"
          size="icon"
          className="size-8 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={onSubmit}
          disabled={isGenerating || !value.trim()}
          aria-label="Generate"
        >
          {isGenerating ? (
            <Sparkles className="size-4 animate-pulse" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
