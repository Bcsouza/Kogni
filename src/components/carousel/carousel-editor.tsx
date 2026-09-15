"use client";

import { useState } from "react";
import Image from "next/image";
import JSZip from "jszip";
import {
  RefreshCw,
  Copy,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GenerationProgress } from "@/components/generation/generation-progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CarouselSlide } from "@/types";

const REFINEMENTS = [
  { id: "more-realistic", label: "More realistic" },
  { id: "more-minimal", label: "More minimal" },
  { id: "more-premium", label: "More premium" },
  { id: "more-colorful", label: "More colorful" },
  { id: "more-professional", label: "More professional" },
];

interface CarouselEditorProps {
  topic: string;
  slides: CarouselSlide[];
  onSlidesChange: (slides: CarouselSlide[]) => void;
  onRegenerateSlide: (slide: CarouselSlide, instruction?: string) => Promise<void>;
  onRegenerateAll: () => void;
  isGenerating: boolean;
}

export function CarouselEditor({
  topic,
  slides,
  onSlidesChange,
  onRegenerateSlide,
  onRegenerateAll,
  isGenerating,
}: CarouselEditorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const active = slides[activeIndex];

  async function handleRegenerate(instruction?: string) {
    if (!active) return;
    setRegeneratingId(active.id);
    await onRegenerateSlide(active, instruction);
    setRegeneratingId(null);
  }

  function handleDuplicate() {
    if (!active) return;
    const copy: CarouselSlide = { ...active, id: crypto.randomUUID(), position: active.position + 0.5 };
    const next = [...slides, copy].sort((a, b) => a.position - b.position).map((s, i) => ({ ...s, position: i + 1 }));
    onSlidesChange(next);
    toast.success("Slide duplicated");
  }

  function handleDelete() {
    if (!active || slides.length <= 1) return;
    const next = slides.filter((s) => s.id !== active.id).map((s, i) => ({ ...s, position: i + 1 }));
    onSlidesChange(next);
    setActiveIndex((i) => Math.max(0, Math.min(i, next.length - 1)));
  }

  function moveSlide(from: number, to: number) {
    if (to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onSlidesChange(next.map((s, i) => ({ ...s, position: i + 1 })));
    setActiveIndex(to);
  }

  async function handleDownloadSlide() {
    if (!active?.imageUrl) return;
    const response = await fetch(active.imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `slide-${active.position}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadAll() {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        slides.map(async (slide, i) => {
          if (!slide.imageUrl) return;
          const response = await fetch(slide.imageUrl);
          const blob = await response.blob();
          zip.file(`slide-${i + 1}.png`, blob);
        }),
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${topic.slice(0, 30).replace(/[^a-z0-9]+/gi, "-") || "kogni-carousel"}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed", { description: "Please try again." });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{topic || "Untitled carousel"}</p>
          <p className="text-xs text-muted-foreground">{slides.length} slides</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onRegenerateAll} disabled={isGenerating}>
            <RefreshCw className="size-3.5" />
            Regenerate all
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleDownloadAll}
            disabled={isExporting || slides.length === 0}
          >
            <Download className="size-3.5" />
            {isExporting ? "Exporting…" : "Export carousel"}
          </Button>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
              activeIndex === i ? "border-brand" : "border-transparent hover:border-border",
            )}
          >
            {slide.imageUrl ? (
              <Image src={slide.imageUrl} alt={`Slide ${i + 1}`} fill unoptimized className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                {i + 1}
              </div>
            )}
            <span className="absolute bottom-0.5 left-0.5 rounded bg-background/80 px-1 text-[9px] font-medium">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_300px]">
        {/* Canvas */}
        <div className="flex flex-col items-center justify-center gap-4 p-6 sm:p-10">
          <div className="relative flex w-full max-w-sm items-center justify-center">
            <button
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="absolute -left-10 hidden size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 sm:flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div
              className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              style={{ aspectRatio: "4 / 5" }}
            >
              {regeneratingId === active?.id ? (
                <GenerationProgress active className="h-full" />
              ) : active?.imageUrl ? (
                <Image src={active.imageUrl} alt={active.headline} fill unoptimized className="object-cover" />
              ) : null}
            </div>
            <button
              onClick={() => setActiveIndex((i) => Math.min(slides.length - 1, i + 1))}
              disabled={activeIndex === slides.length - 1}
              className="absolute -right-10 hidden size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 sm:flex"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Slide {activeIndex + 1} / {slides.length}
          </p>
        </div>

        {/* Slide controls */}
        <div className="space-y-4 border-border p-4 lg:border-l">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Headline</p>
            <p className="mt-1 text-sm font-medium">{active?.headline}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Body</p>
            <p className="mt-1 text-sm text-muted-foreground">{active?.body}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Edit this slide</p>
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Make this slide more minimalist"
              rows={3}
              className="resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={!editPrompt.trim() || regeneratingId === active?.id}
                onClick={() => {
                  handleRegenerate(editPrompt);
                  setEditPrompt("");
                }}
              >
                Regenerate
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>Quick</DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {REFINEMENTS.map((r) => (
                    <DropdownMenuItem key={r.id} onClick={() => handleRegenerate(r.id)}>
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDuplicate}>
              <Copy className="size-3.5" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDelete} disabled={slides.length <= 1}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => moveSlide(activeIndex, activeIndex - 1)}>
              <GripVertical className="size-3.5" />
              Move left
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => moveSlide(activeIndex, activeIndex + 1)}>
              <GripVertical className="size-3.5" />
              Move right
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadSlide}>
              <Download className="size-3.5" />
              Download slide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
