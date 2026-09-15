"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageIcon, Layers, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({
  project,
  onToggleFavorite,
  onDelete,
}: {
  project: Project;
  onToggleFavorite: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand/30">
      <Link href={`/create?prompt=${encodeURIComponent(project.prompt)}&type=${project.type}`}>
        <div className="relative aspect-4/5 bg-muted">
          {project.coverImageUrl ? (
            <Image src={project.coverImageUrl} alt={project.name} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              {project.type === "carousel" ? <Layers className="size-6" /> : <ImageIcon className="size-6" />}
            </div>
          )}
          {project.status === "generating" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{project.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {project.type}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onToggleFavorite(project.id, !project.isFavorite)}
          >
            <Heart className={cn("size-3.5", project.isFavorite && "fill-brand text-brand")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7" />}>
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(project.id)} className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
