"use client";

import { STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StylePicker({ value, onChange }: { value: string | undefined; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          title={style.description}
          className={cn(
            "rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
            value === style.id ? "border-brand bg-brand/[0.06] text-foreground" : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}
