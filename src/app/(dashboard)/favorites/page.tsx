"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { GridSkeleton } from "@/components/shared/loading-state";
import { toast } from "sonner";
import type { Project } from "@/types";

export default function FavoritesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?favorites=true")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => toast.error("Couldn't load your favorites."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggleFavorite(id: string, next: boolean) {
    setProjects((prev) => (next ? prev : prev.filter((p) => p.id !== id)));
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
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Your starred creations.</p>

      {isLoading ? (
        <GridSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Star a project to find it here quickly." />
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
