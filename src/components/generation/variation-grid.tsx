"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Variation {
  url: string;
  width: number;
  height: number;
}

export function VariationGrid({
  images,
  selectedIndex,
  onSelect,
}: {
  images: Variation[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((image, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "group relative overflow-hidden rounded-lg border-2 transition-colors",
            selectedIndex === i ? "border-brand" : "border-transparent hover:border-border",
          )}
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image src={image.url} alt={`Variation ${i + 1}`} fill unoptimized className="object-cover" />
          {selectedIndex === i && (
            <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <Check className="size-3" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
