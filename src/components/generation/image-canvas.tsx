"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { GenerationProgress } from "@/components/generation/generation-progress";
import { ErrorState } from "@/components/shared/error-state";
import type { AspectRatioId } from "@/types";
import { FORMATS } from "@/lib/constants";

interface ImageCanvasProps {
  imageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  formatId: AspectRatioId;
  onRetry?: () => void;
}

export function ImageCanvas({ imageUrl, isGenerating, error, formatId, onRetry }: ImageCanvasProps) {
  const format = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0];

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center p-6 sm:p-10">
      <div
        className="relative flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        style={{ aspectRatio: `${format.width} / ${format.height}`, width: "min(100%, 520px)" }}
      >
        {isGenerating ? (
          <GenerationProgress active className="w-full" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} creditsRefunded className="w-full border-0 bg-transparent" />
        ) : imageUrl ? (
          <Image src={imageUrl} alt="Generated visual" fill unoptimized className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-5" />
            </div>
            <p className="max-w-52 text-sm">Your generated visual will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
