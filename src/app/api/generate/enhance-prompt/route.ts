import { NextResponse } from "next/server";
import { z } from "zod";
import { enhancePrompt } from "@/lib/ai/prompt-enhancer";

const bodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  style: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const enhanced = await enhancePrompt(parsed.data.prompt, parsed.data.style);
    return NextResponse.json({ prompt: enhanced });
  } catch (error) {
    console.error("enhance-prompt failed", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
