"use client";

import { useEffect, useState } from "react";
import { Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { GridSkeleton } from "@/components/shared/loading-state";
import { toast } from "sonner";
import type { Project, ProjectType } from "@/types";

const FILTERS: { id: string; label: string; type?: ProjectType; favorites?: boolean }[] = [
  { id: "all", label: "All" },
  { id: "post", label: "Posts", type: "post" },
  { id: "carousel", label: "Carousels", type: "carousel" },
  { id: "ad", label: "Ads", type: "ad" },
  { id: "story", label: "Stories", type: "story" },
  { id: "favorites", label: "Favorites", favorites: true },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const activeFilter = FILTERS.find((f) => f.id === filter);
    const params = new URLSearchParams();
    if (activeFilter?.type) params.set("type", activeFilter.type);
    if (activeFilter?.favorites) params.set("favorites", "true");
    if (search) params.set("q", search);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-filter-change loading flag
    setIsLoading(true);
    fetch(`/api/projects?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects ?? []);
        setIsDemo(Boolean(data.demo));
      })
      .catch(() => toast.error("Couldn't load your projects."))
      .finally(() => setIsLoading(false));
  }, [filter, search]);

  async function handleToggleFavorite(id: string, next: boolean) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: next } : p)));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });
  }

  async function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    toast.success("Project deleted");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything you&apos;ve created with Kogni.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isDemo && (
        <p className="mb-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Demo mode — connect Supabase to persist and list your real projects.
        </p>
      )}

      {isLoading ? (
        <GridSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Everything you create will show up here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
