import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectType } from "@/types";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type as ProjectType,
    prompt: row.prompt,
    format: row.format as Project["format"],
    status: row.status as Project["status"],
    coverImageUrl: row.cover_image_url,
    model: row.model ?? "",
    creditsConsumed: row.credits_consumed,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProjects(filter?: { type?: ProjectType; favoritesOnly?: boolean; search?: string }) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

  if (filter?.type) query = query.eq("type", filter.type);
  if (filter?.favoritesOnly) query = query.eq("is_favorite", true);
  if (filter?.search) query = query.ilike("name", `%${filter.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toProject);
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return toProject(data);
}

export async function createProject(input: {
  userId: string;
  name: string;
  type: ProjectType;
  prompt: string;
  format: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: input.userId,
      name: input.name,
      type: input.type,
      prompt: input.prompt,
      format: input.format,
      status: "queued",
    })
    .select("*")
    .single();

  if (error) throw error;
  return toProject(data);
}

export async function updateProjectStatus(
  id: string,
  status: Project["status"],
  extra?: { coverImageUrl?: string; model?: string; creditsConsumed?: number },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      status,
      ...(extra?.coverImageUrl !== undefined ? { cover_image_url: extra.coverImageUrl } : {}),
      ...(extra?.model !== undefined ? { model: extra.model } : {}),
      ...(extra?.creditsConsumed !== undefined ? { credits_consumed: extra.creditsConsumed } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ is_favorite: isFavorite }).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
