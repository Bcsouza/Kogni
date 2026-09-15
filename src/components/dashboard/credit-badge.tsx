"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CreditsResponse {
  used: number;
  total: number;
  planId: string;
  demo?: boolean;
}

export function CreditBadge({ collapsed }: { collapsed?: boolean }) {
  const [credits, setCredits] = useState<CreditsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/credits")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setCredits(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!credits) return null;

  const remaining = Math.max(0, credits.total - credits.used);
  const pct = credits.total > 0 ? (remaining / credits.total) * 100 : 0;

  if (collapsed) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-sidebar-accent p-2" title={`${remaining} credits left`}>
        <Zap className="size-4 text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-sidebar-accent p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-sidebar-foreground">
          <Zap className="size-3.5 text-brand" />
          Credits
        </span>
        <span className="text-muted-foreground">
          {remaining} / {credits.total}
        </span>
      </div>
      <Progress value={pct} className={cn("h-1.5")} />
      {credits.demo && <p className="text-[10px] text-muted-foreground">Demo mode — connect Supabase to persist usage.</p>}
    </div>
  );
}
