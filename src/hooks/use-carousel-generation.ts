"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { CarouselSlide } from "@/types";

export interface CarouselGenerationRequest {
  topic: string;
  slideCount: number;
  audience?: string;
  tone?: string;
  style?: string;
}

export function useCarouselGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (request: CarouselGenerationRequest) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "insufficient_credits") {
          setError(`Not enough credits (${data.balance} left, ${data.required} needed).`);
          toast.error("Out of credits", { description: "Upgrade your plan to keep creating." });
        } else {
          setError(data.message ?? "We couldn't generate this carousel.");
        }
        return null;
      }

      setSlides(data.slides ?? []);
      setProjectId(data.projectId ?? null);
      return data as { slides: CarouselSlide[]; projectId: string | null };
    } catch {
      setError("Kogni is having trouble reaching the image engine. Please try again in a moment.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerateSlide = useCallback(
    async (slide: CarouselSlide, instruction?: string) => {
      const response = await fetch("/api/generate/regenerate-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId: slide.id, projectId, basePrompt: slide.prompt, instruction }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error("Regeneration failed", { description: data.message ?? "Please try again." });
        return;
      }

      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, imageUrl: data.imageUrl, prompt: data.prompt } : s)),
      );
    },
    [projectId],
  );

  return { generate, isGenerating, slides, setSlides, projectId, error, regenerateSlide };
}
