"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Image as ImageIcon, Layers, Megaphone, MonitorPlay, Clapperboard, Shapes } from "lucide-react";
import { PromptInput } from "@/components/generation/prompt-input";
import { EXAMPLE_PROMPTS, QUICK_ACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  post: ImageIcon,
  carousel: Layers,
  ad: Megaphone,
  story: MonitorPlay,
  thumbnail: Clapperboard,
  custom: Shapes,
};

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function goToCreate(params: { prompt?: string; type?: string; format?: string }) {
    const search = new URLSearchParams();
    if (params.prompt) search.set("prompt", params.prompt);
    if (params.type) search.set("type", params.type);
    if (params.format) search.set("format", params.format);
    router.push(`/create?${search.toString()}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-balance text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        What will you create today?
      </h1>
      <p className="mt-3 text-center text-muted-foreground">Turn your ideas into stunning visuals with AI.</p>

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => prompt.trim() && goToCreate({ prompt })}
        className="mt-10 w-full"
        minRows={3}
      />

      <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICONS[action.type] ?? ImageIcon;
          return (
            <button
              key={action.id}
              onClick={() => goToCreate({ type: action.type, format: action.format })}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-4 text-center transition-colors hover:border-brand/40 hover:bg-accent",
              )}
            >
              <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 w-full">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Try one of these</p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => goToCreate({ prompt: example })}
              className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
