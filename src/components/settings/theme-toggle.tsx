"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical hydration-safe mount flag; no external system to sync from
  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex rounded-lg border border-border p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mounted && theme === opt.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <opt.icon className="size-3.5" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
