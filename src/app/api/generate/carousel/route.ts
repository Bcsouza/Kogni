import { NextResponse } from "next/server";
import { z } from "zod";
import { getImageGenerationProvider } from "@/lib/ai/provider";
import { enhancePrompt } from "@/lib/ai/prompt-enhancer";
import { structureCarousel } from "@/lib/ai/carousel-structurer";
import { ImageGenerationError } from "@/lib/ai/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GENERATION_COST, InsufficientCreditsError, reserveCredits, refundCredits } from "@/lib/credits";
import { createProject, updateProjectStatus } from "@/lib/projects";
import { persistGeneratedImage } from "@/lib/storage";
import { CAROUSEL_FORMAT } from "@/lib/constants";
import type { CarouselSlide } from "@/types";

const bodySchema = z.object({
  topic: z.string().min(3).max(2000),
  slideCount: z.number().int().min(3).max(12).default(7),
  audience: z.string().optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const input = parsed.data;
  const cost = GENERATION_COST.carouselSlide * input.slideCount;

  let userId: string | null = null;
  let projectId: string | null = null;
  let carouselId: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    userId = user.id;

    try {
      await reserveCredits(userId, cost, "carousel_generation");
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: "insufficient_credits", balance: error.balance, required: error.required },
          { status: 402 },
        );
      }
      throw error;
    }

    const project = await createProject({
      userId,
      name: input.topic.slice(0, 60),
      type: "carousel",
      prompt: input.topic,
      format: CAROUSEL_FORMAT.id,
    });
    projectId = project.id;
    await updateProjectStatus(projectId, "generating");

    const service = createServiceRoleClient();
    const { data: carousel, error } = await service
      .from("carousels")
      .insert({
        project_id: projectId,
        slide_count: input.slideCount,
        audience: input.audience ?? null,
        tone: input.tone ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    carouselId = carousel.id;
  }

  try {
    const outline = await structureCarousel({
      topic: input.topic,
      slideCount: input.slideCount,
      audience: input.audience,
      tone: input.tone,
    });

    const provider = await getImageGenerationProvider();

    // Consistent visual identity across slides: one enhanced base prompt,
    // reused with per-slide headline/body baked in, so palette, lighting and
    // composition style stay coherent across the whole carousel.
    const basePrompt = await enhancePrompt(
      `Instagram carousel slide background for a series about "${input.topic}". Consistent visual identity across all slides.`,
      input.style,
    );

    const slides: CarouselSlide[] = await Promise.all(
      outline.map(async (slide) => {
        const slidePrompt = `${basePrompt} This specific slide (${slide.position} of ${input.slideCount}, "${slide.role}" beat) should visually support the headline: "${slide.headline}". Render the headline as bold, legible on-image typography, plus a smaller supporting line: "${slide.body}". Keep the same background style, palette and mood as the rest of the series.`;

        const result = await provider.generate({
          prompt: slidePrompt,
          width: CAROUSEL_FORMAT.width,
          height: CAROUSEL_FORMAT.height,
          quality: "standard",
          style: input.style,
        });

        let imageUrl = result.images[0]?.url ?? null;

        if (isSupabaseConfigured() && userId && projectId && imageUrl) {
          imageUrl = await persistGeneratedImage({ userId, projectId, source: imageUrl, index: slide.position });
        }

        return {
          id: crypto.randomUUID(),
          carouselId: carouselId ?? "local",
          position: slide.position,
          role: slide.role,
          headline: slide.headline,
          body: slide.body,
          imageUrl,
          prompt: slidePrompt,
          status: "completed" as const,
        };
      }),
    );

    if (isSupabaseConfigured() && carouselId && projectId && userId) {
      const service = createServiceRoleClient();
      await service.from("carousel_slides").insert(
        slides.map((s) => ({
          carousel_id: carouselId!,
          position: s.position,
          role: s.role,
          headline: s.headline,
          body: s.body,
          image_url: s.imageUrl,
          prompt: s.prompt,
          status: s.status,
        })),
      );
      await service.from("generations").insert({
        project_id: projectId,
        user_id: userId,
        provider: provider.id,
        model: provider.model,
        prompt: input.topic,
        status: "completed",
        credits_cost: cost,
      });
      await updateProjectStatus(projectId, "completed", {
        coverImageUrl: slides[0]?.imageUrl ?? undefined,
        model: provider.model,
        creditsConsumed: cost,
      });
    }

    return NextResponse.json({
      projectId,
      carouselId,
      slides,
      creditsCost: isSupabaseConfigured() ? cost : 0,
    });
  } catch (error) {
    if (isSupabaseConfigured() && userId) {
      if (projectId) await updateProjectStatus(projectId, "failed");
      await refundCredits(userId, cost, "carousel_generation_failed", projectId ?? undefined);
    }

    if (error instanceof ImageGenerationError) {
      const status = error.code === "rate_limited" ? 429 : error.code === "content_blocked" ? 422 : 502;
      return NextResponse.json({ error: error.code, message: error.message, retryable: error.retryable }, { status });
    }

    console.error("generate/carousel failed", error);
    return NextResponse.json({ error: "unknown", message: "Something went wrong.", retryable: true }, { status: 500 });
  }
}
