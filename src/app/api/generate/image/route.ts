import { NextResponse } from "next/server";
import { z } from "zod";
import { getImageGenerationProvider } from "@/lib/ai/provider";
import { enhancePrompt } from "@/lib/ai/prompt-enhancer";
import { ImageGenerationError } from "@/lib/ai/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GENERATION_COST, InsufficientCreditsError, reserveCredits, refundCredits } from "@/lib/credits";
import { createProject, updateProjectStatus } from "@/lib/projects";
import { persistGeneratedImage } from "@/lib/storage";
import { FORMATS } from "@/lib/constants";

const bodySchema = z.object({
  prompt: z.string().min(3).max(2000),
  formatId: z.string().default("square-1-1"),
  style: z.string().optional(),
  quality: z.enum(["draft", "standard", "high"]).optional(),
  count: z.number().int().min(1).max(4).default(1),
  negativePrompt: z.string().optional(),
  seed: z.number().int().optional(),
  skipEnhance: z.boolean().optional(),
  projectName: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const input = parsed.data;
  const format = FORMATS.find((f) => f.id === input.formatId) ?? FORMATS[0];
  const cost = GENERATION_COST.image * input.count;

  let userId: string | null = null;
  let projectId: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    userId = user.id;

    try {
      await reserveCredits(userId, cost, "image_generation");
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
      name: input.projectName ?? input.prompt.slice(0, 60),
      type: "post",
      prompt: input.prompt,
      format: format.id,
    });
    projectId = project.id;
    await updateProjectStatus(projectId, "generating");
  }

  try {
    const finalPrompt = input.skipEnhance ? input.prompt : await enhancePrompt(input.prompt, input.style);
    const provider = await getImageGenerationProvider();

    const result = await provider.generate({
      prompt: finalPrompt,
      width: format.width,
      height: format.height,
      count: input.count,
      style: input.style,
      quality: input.quality ?? "standard",
      negativePrompt: input.negativePrompt,
      seed: input.seed,
    });

    let images = result.images;

    if (isSupabaseConfigured() && userId && projectId) {
      const persisted = await Promise.all(
        result.images.map((img, i) =>
          persistGeneratedImage({ userId: userId!, projectId: projectId!, source: img.url, index: i }),
        ),
      );
      images = result.images.map((img, i) => ({ ...img, url: persisted[i] }));

      const supabase = createServiceRoleClient();
      await supabase.from("project_assets").insert(
        images.map((img, i) => ({
          project_id: projectId!,
          url: img.url,
          width: img.width,
          height: img.height,
          is_selected: i === 0,
        })),
      );
      await supabase.from("generations").insert({
        project_id: projectId,
        user_id: userId,
        provider: result.provider,
        model: result.model,
        prompt: finalPrompt,
        status: "completed",
        credits_cost: cost,
      });

      await updateProjectStatus(projectId, "completed", {
        coverImageUrl: images[0]?.url,
        model: result.model,
        creditsConsumed: cost,
      });
    }

    return NextResponse.json({
      projectId,
      prompt: finalPrompt,
      images,
      provider: result.provider,
      model: result.model,
      creditsCost: isSupabaseConfigured() ? cost : 0,
    });
  } catch (error) {
    if (isSupabaseConfigured() && userId) {
      if (projectId) await updateProjectStatus(projectId, "failed");
      await refundCredits(userId, cost, "image_generation_failed", projectId ?? undefined);
    }

    if (error instanceof ImageGenerationError) {
      const status = error.code === "rate_limited" ? 429 : error.code === "content_blocked" ? 422 : 502;
      return NextResponse.json(
        { error: error.code, message: error.message, retryable: error.retryable },
        { status },
      );
    }

    console.error("generate/image failed", error);
    return NextResponse.json({ error: "unknown", message: "Something went wrong.", retryable: true }, { status: 500 });
  }
}
