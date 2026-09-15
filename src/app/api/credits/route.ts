import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getCreditBalance, PLAN_CREDITS } from "@/lib/credits";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ used: 0, total: PLAN_CREDITS.free, planId: "free", demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("plan_id").eq("id", user.id).single();
  const planId = (profile?.plan_id ?? "free") as keyof typeof PLAN_CREDITS;
  const balance = await getCreditBalance(user.id);
  const total = PLAN_CREDITS[planId];

  return NextResponse.json({ used: Math.max(0, total - balance), total, balance, planId });
}
