import { NextResponse } from "next/server";
import { z } from "zod";
import { getImageGenerationProvider } from "@/lib/ai/provider";
import { ImageGenerationError } from "@/lib/ai/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GENERATION_COST, InsufficientCreditsError, reserveCredits, refundCredits } from "@/lib/credits";
import { persistGeneratedImage } from "@/lib/storage";
import { CAROUSEL_FORMAT } from "@/lib/constants";

const bodySchema = z.object({
  slideId: z.string(),
  projectId: z.string().optional(),
  basePrompt: z.string().min(3),
  instruction: z.string().max(500).optional(),
});

const REFINEMENTS: Record<string, string> = {
  "more-realistic": "Make it more photorealistic with natural lighting and depth.",
  "more-minimal": "Simplify the composition further, more negative space, fewer elements.",
  "more-premium": "Elevate to a premium, high-end aesthetic with refined details.",
  "more-colorful": "Introduce richer, more vibrant color accents while staying on-brand.",
  "more-professional": "Make it more corporate and polished, sharper typography.",
};

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const input = parsed.data;
  const cost = GENERATION_COST.carouselSlide;
  let userId: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    userId = user.id;

    try {
      await reserveCredits(userId, cost, "slide_regeneration");
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: "insufficient_credits", balance: error.balance, required: error.required },
          { status: 402 },
        );
      }
      throw error;
    }
  }

  try {
    const instructionText = REFINEMENTS[input.instruction ?? ""] ?? input.instruction ?? "";
    const finalPrompt = instructionText ? `${input.basePrompt} ${instructionText}` : input.basePrompt;

    const provider = await getImageGenerationProvider();
    const result = await provider.generate({
      prompt: finalPrompt,
      width: CAROUSEL_FORMAT.width,
      height: CAROUSEL_FORMAT.height,
      quality: "standard",
    });

    let imageUrl = result.images[0]?.url ?? null;

    if (isSupabaseConfigured() && userId && imageUrl && input.projectId) {
      imageUrl = await persistGeneratedImage({
        userId,
        projectId: input.projectId,
        source: imageUrl,
        index: Date.now() % 1000,
      });

      const service = createServiceRoleClient();
      await service
        .from("carousel_slides")
        .update({ image_url: imageUrl, prompt: finalPrompt, status: "completed" })
        .eq("id", input.slideId);
    }

    return NextResponse.json({ slideId: input.slideId, imageUrl, prompt: finalPrompt, creditsCost: isSupabaseConfigured() ? cost : 0 });
  } catch (error) {
    if (isSupabaseConfigured() && userId) {
      await refundCredits(userId, cost, "slide_regeneration_failed");
    }

    if (error instanceof ImageGenerationError) {
      const status = error.code === "rate_limited" ? 429 : error.code === "content_blocked" ? 422 : 502;
      return NextResponse.json({ error: error.code, message: error.message, retryable: error.retryable }, { status });
    }

    console.error("regenerate-slide failed", error);
    return NextResponse.json({ error: "unknown", message: "Something went wrong.", retryable: true }, { status: 500 });
  }
}
