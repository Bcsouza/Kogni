"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { GENERATION_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  /** Whether the underlying request is still in flight. */
  active: boolean;
  className?: string;
}

/**
 * Purely presentational staged progress — advances on a timer while `active`
 * is true, independent of real backend milestones. This keeps the "premium"
 * generation feel responsive even though the actual provider call is a single
 * request/response with no intermediate progress events.
 */
export function GenerationProgress({ active, className }: GenerationProgressProps) {
  // Keyed remount (rather than resetting state inside an effect) so each new
  // generation run starts its step animation from zero automatically.
  return active ? <ActiveGenerationProgress className={className} /> : null;
}

function ActiveGenerationProgress({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, GENERATION_STEPS.length - 1));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-12 text-center", className)}>
      <div className="relative flex size-16 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
        <div className="relative flex size-14 items-center justify-center rounded-full bg-brand/10">
          <Loader2 className="size-6 animate-spin text-brand" />
        </div>
      </div>
      <div>
        <p className="text-base font-medium text-foreground">Kogni is creating…</p>
        <p className="mt-1 text-sm text-muted-foreground">This usually takes a few seconds.</p>
      </div>
      <ul className="space-y-2 text-sm">
        {GENERATION_STEPS.map((step, i) => (
          <li
            key={step}
            className={cn(
              "flex items-center gap-2 transition-colors",
              i < stepIndex && "text-muted-foreground",
              i === stepIndex && "font-medium text-foreground",
              i > stepIndex && "text-muted-foreground/40",
            )}
          >
            {i < stepIndex ? (
              <Check className="size-3.5 shrink-0 text-brand" />
            ) : i === stepIndex ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-brand" />
            ) : (
              <span className="size-3.5 shrink-0 rounded-full border border-current" />
            )}
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
