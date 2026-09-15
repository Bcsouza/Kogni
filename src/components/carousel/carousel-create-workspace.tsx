"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StylePicker } from "@/components/generation/style-picker";
import { ErrorState } from "@/components/shared/error-state";
import { GenerationProgress } from "@/components/generation/generation-progress";
import { CarouselEditor } from "@/components/carousel/carousel-editor";
import { useCarouselGeneration } from "@/hooks/use-carousel-generation";

export function CarouselCreateWorkspace({ initialTopic }: { initialTopic: string }) {
  const [topic, setTopic] = useState(initialTopic);
  const [slideCount, setSlideCount] = useState(7);
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [style, setStyle] = useState<string>();

  const { generate, isGenerating, slides, setSlides, error, regenerateSlide } = useCarouselGeneration();

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, slideCount, audience: audience || undefined, tone: tone || undefined, style });
  }

  if (slides.length > 0) {
    return (
      <CarouselEditor
        topic={topic}
        slides={slides}
        onSlidesChange={setSlides}
        onRegenerateSlide={regenerateSlide}
        onRegenerateAll={handleGenerate}
        isGenerating={isGenerating}
      />
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <GenerationProgress active />
          <p className="text-xs text-muted-foreground">Structuring and generating {slideCount} slides…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Create a carousel</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your topic — Kogni structures the narrative and generates every slide with a consistent identity.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="topic">Topic</Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="The 5 mistakes entrepreneurs make when using AI"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slideCount">Slides ({slideCount})</Label>
          <input
            id="slideCount"
            type="range"
            min={3}
            max={12}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audience">Audience</Label>
          <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Entrepreneurs" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tone">Tone</Label>
        <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Professional and educational" />
      </div>

      <div className="space-y-1.5">
        <Label>Style</Label>
        <StylePicker value={style} onChange={setStyle} />
      </div>

      {error && <ErrorState message={error} onRetry={handleGenerate} creditsRefunded />}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        className="bg-brand text-brand-foreground hover:bg-brand/90"
      >
        Generate carousel
      </Button>
    </div>
  );
}
