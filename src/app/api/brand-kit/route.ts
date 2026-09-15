import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_KIT = {
  name: "My Brand",
  primaryColor: "#000000",
  secondaryColor: "#FFFFFF",
  accentColor: "#3B82F6",
  font: "Inter",
  style: "Minimal",
  toneOfVoice: "",
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ brandKit: DEFAULT_KIT, demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase.from("brand_kits").select("*").eq("user_id", user.id).maybeSingle();

  if (!data) {
    return NextResponse.json({ brandKit: DEFAULT_KIT });
  }

  return NextResponse.json({
    brandKit: {
      name: data.name,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      font: data.font,
      style: data.style,
      toneOfVoice: data.tone_of_voice ?? "",
    },
  });
}

const bodySchema = z.object({
  name: z.string().min(1).max(80),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  font: z.string(),
  style: z.string(),
  toneOfVoice: z.string().max(500).optional(),
});

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const { error } = await supabase.from("brand_kits").upsert(
    {
      user_id: user.id,
      name: parsed.data.name,
      primary_color: parsed.data.primaryColor,
      secondary_color: parsed.data.secondaryColor,
      accent_color: parsed.data.accentColor,
      font: parsed.data.font,
      style: parsed.data.style,
      tone_of_voice: parsed.data.toneOfVoice ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("brand kit save failed", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
