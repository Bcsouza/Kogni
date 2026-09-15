"use client";

import { useState } from "react";
import { RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormatPicker } from "@/components/generation/format-picker";
import { StylePicker } from "@/components/generation/style-picker";
import { ImageCanvas } from "@/components/generation/image-canvas";
import { VariationGrid } from "@/components/generation/variation-grid";
import { ExportMenu } from "@/components/generation/export-menu";
import { useImageGeneration } from "@/hooks/use-image-generation";
import type { AspectRatioId } from "@/types";
import { QUALITY_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";

const REFINEMENTS = [
  { id: "more-realistic", label: "More realistic" },
  { id: "more-minimal", label: "More minimal" },
  { id: "more-premium", label: "More premium" },
  { id: "more-colorful", label: "More colorful" },
  { id: "more-professional", label: "More professional" },
];

export function ImageCreateWorkspace({
  initialPrompt,
  initialFormat,
}: {
  initialPrompt: string;
  initialFormat: AspectRatioId;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [format, setFormat] = useState<AspectRatioId>(initialFormat);
  const [style, setStyle] = useState<string>();
  const [quality, setQuality] = useState<"draft" | "standard" | "high">("standard");
  const [count, setCount] = useState(2);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const { generate, isGenerating, images, error } = useImageGeneration();

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setSelectedIndex(0);
    await generate({ prompt, formatId: format, style, quality, count });
  }

  async function handleRefine(instruction: string, label: string) {
    if (!prompt.trim()) return;
    setSelectedIndex(0);
    toast.info(`Regenerating — ${label.toLowerCase()}…`);
    await generate({ prompt: `${prompt} (${instruction})`, formatId: format, style, quality, count: 1 });
  }

  const selectedImage = images[selectedIndex] ?? null;

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[280px_1fr_260px]">
      {/* Controls */}
      <ScrollArea className="border-border lg:h-[calc(100vh-4rem)] lg:border-r">
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={5}
              className="resize-none text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              disabled={isEnhancing || !prompt.trim()}
              onClick={async () => {
                setIsEnhancing(true);
                try {
                  const res = await fetch("/api/generate/enhance-prompt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, style }),
                  });
                  const data = await res.json();
                  if (res.ok && data.prompt) {
                    setPrompt(data.prompt);
                  } else {
                    toast.error("Couldn't enhance the prompt. Please try again.");
                  }
                } catch {
                  toast.error("Couldn't enhance the prompt. Please try again.");
                } finally {
                  setIsEnhancing(false);
                }
              }}
            >
              <Wand2 className="size-3.5" />
              Improve prompt
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Format</Label>
            <FormatPicker value={format} onChange={setFormat} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Style</Label>
            <StylePicker value={style} onChange={setStyle} />
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Advanced
            </summary>
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <div className="flex gap-1.5">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuality(q.id)}
                      className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                        quality === q.id ? "border-brand bg-brand/[0.06]" : "border-border text-muted-foreground"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Variations ({count})</Label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
              </div>
            </div>
          </details>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </ScrollArea>

      {/* Canvas */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-xs text-muted-foreground">{prompt ? "Preview" : "New creation"}</span>
          <div className="flex items-center gap-2">
            {selectedImage && !isGenerating && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
                  <RefreshCw className="size-3.5" />
                  Regenerate
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleGenerate()}>Same idea</DropdownMenuItem>
                  {REFINEMENTS.map((r) => (
                    <DropdownMenuItem key={r.id} onClick={() => handleRefine(r.id, r.label)}>
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ExportMenu imageUrl={selectedImage?.url ?? null} filename="kogni-post" />
          </div>
        </div>
        <ImageCanvas
          imageUrl={selectedImage?.url ?? null}
          isGenerating={isGenerating}
          error={error}
          formatId={format}
          onRetry={handleGenerate}
        />
      </div>

      {/* Variations */}
      <ScrollArea className="border-border lg:h-[calc(100vh-4rem)] lg:border-l">
        <div className="space-y-3 p-4">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Variations</Label>
          {images.length > 0 ? (
            <VariationGrid images={images} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          ) : (
            <p className="text-xs text-muted-foreground">Generated variations will appear here.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
