"use client";

import { useRouter } from "next/navigation";
import { Layers, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/types";

export function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();

  function useTemplate() {
    const search = new URLSearchParams({
      prompt: template.prompt,
      type: template.slideCount ? "carousel" : "post",
    });
    router.push(`/create?${search.toString()}`);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand/30">
      <div className="relative flex aspect-4/5 items-center justify-center bg-gradient-to-br from-muted to-card text-muted-foreground">
        {template.slideCount ? <Layers className="size-6" /> : <ImageIcon className="size-6" />}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-background/0 p-3 opacity-0 transition-opacity group-hover:bg-background/70 group-hover:opacity-100">
          <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={useTemplate}>
            Use this template
          </Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium">{template.name}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {template.slideCount && (
            <Badge variant="secondary" className="text-[10px]">
              {template.slideCount} slides
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px]">
            {template.style}
          </Badge>
        </div>
      </div>
    </div>
  );
}
