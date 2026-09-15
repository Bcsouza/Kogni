import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { deleteProject, toggleFavorite } from "@/lib/projects";

const patchSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    if (parsed.data.isFavorite !== undefined) {
      await toggleFavorite(id, parsed.data.isFavorite);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("update project failed", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { id } = await params;
  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("delete project failed", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
