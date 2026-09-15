"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface GeneratedImageResult {
  url: string;
  width: number;
  height: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  formatId: string;
  style?: string;
  quality?: "draft" | "standard" | "high";
  count?: number;
  projectName?: string;
}

interface GenerationApiError {
  error: string;
  message?: string;
  retryable?: boolean;
  balance?: number;
  required?: number;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const generate = useCallback(async (request: ImageGenerationRequest) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        const err = data as GenerationApiError;
        if (err.error === "insufficient_credits") {
          setError(`Not enough credits (${err.balance} left, ${err.required} needed).`);
          toast.error("Out of credits", { description: "Upgrade your plan to keep creating." });
        } else {
          setError(err.message ?? "We couldn't generate this visual.");
        }
        return null;
      }

      setImages(data.images ?? []);
      setProjectId(data.projectId ?? null);
      return data as { images: GeneratedImageResult[]; projectId: string | null; prompt: string };
    } catch {
      setError("Kogni is having trouble reaching the image engine. Please try again in a moment.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImages([]);
    setError(null);
    setProjectId(null);
  }, []);

  return { generate, isGenerating, images, error, projectId, reset };
}
