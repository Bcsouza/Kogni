"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCreateWorkspace } from "@/components/generation/image-create-workspace";
import { CarouselCreateWorkspace } from "@/components/carousel/carousel-create-workspace";
import type { AspectRatioId } from "@/types";

function CreateContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "carousel" ? "carousel" : "image";
  const initialPrompt = searchParams.get("prompt") ?? "";
  const initialFormat = (searchParams.get("format") as AspectRatioId) ?? "square-1-1";

  const [mode, setMode] = useState<"image" | "carousel">(initialType);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-screen">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "image" | "carousel")}>
          <TabsList>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "image" ? (
        <ImageCreateWorkspace initialPrompt={initialPrompt} initialFormat={initialFormat} />
      ) : (
        <CarouselCreateWorkspace initialTopic={initialType === "carousel" ? initialPrompt : ""} />
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreateContent />
    </Suspense>
  );
}
