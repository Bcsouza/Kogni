"use client";

import { FORMATS } from "@/lib/constants";
import type { AspectRatioId } from "@/types";
import { cn } from "@/lib/utils";

export function FormatPicker({ value, onChange }: { value: AspectRatioId; onChange: (id: AspectRatioId) => void }) {
  const groups = Array.from(new Set(FORMATS.map((f) => f.group)));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {FORMATS.filter((f) => f.group === group).map((format) => (
              <button
                key={format.id}
                onClick={() => onChange(format.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  value === format.id ? "border-brand bg-brand/[0.06]" : "border-border hover:bg-accent",
                )}
              >
                <span
                  className="rounded-sm border border-current/30 bg-current/10"
                  style={{
                    width: 16,
                    height: Math.round((16 * format.height) / format.width) || 16,
                    maxHeight: 20,
                  }}
                />
                <span className="text-xs font-medium leading-tight">{format.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
