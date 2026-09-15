"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TemplateCard } from "@/components/templates/template-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TEMPLATES } from "@/lib/templates-data";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    if (category && t.category !== category) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start from a professionally designed starting point.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-8" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            category === null ? "border-brand bg-brand/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === c ? "border-brand bg-brand/[0.08] text-foreground" : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={LayoutTemplate} title="No templates found" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {category && (
        <p className="mt-4 text-xs text-muted-foreground">
          <Badge variant="secondary">{filtered.length} templates</Badge>
        </p>
      )}
    </div>
  );
}
