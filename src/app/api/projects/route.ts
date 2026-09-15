import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listProjects } from "@/lib/projects";
import type { ProjectType } from "@/types";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ projects: [], demo: true });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ProjectType | null;
  const favoritesOnly = searchParams.get("favorites") === "true";
  const search = searchParams.get("q") ?? undefined;

  try {
    const projects = await listProjects({ type: type ?? undefined, favoritesOnly, search });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("list projects failed", error);
    return NextResponse.json({ error: "unknown", message: "Could not load projects." }, { status: 500 });
  }
}
