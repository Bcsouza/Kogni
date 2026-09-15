import "server-only";
import { getTextGenerationProvider, isMockAiMode } from "@/lib/ai/provider";
import type { SlideRole } from "@/types";

export interface SlideOutline {
  position: number;
  role: SlideRole;
  headline: string;
  body: string;
}

export interface CarouselStructureParams {
  topic: string;
  slideCount: number;
  audience?: string;
  tone?: string;
}

// Canonical narrative arc. For slide counts below 8 we compress by dropping
// the least essential beats first; above 8 we repeat "example" beats.
const FULL_ARC: SlideRole[] = ["hook", "problem", "context", "insight", "example", "solution", "cta", "conclusion"];
const DROP_ORDER: SlideRole[] = ["context", "conclusion", "example", "insight", "problem"];

function roleSequence(count: number): SlideRole[] {
  if (count >= FULL_ARC.length) {
    const seq = [...FULL_ARC];
    while (seq.length < count) {
      seq.splice(seq.length - 2, 0, "example");
    }
    return seq;
  }

  const seq = [...FULL_ARC];
  for (const role of DROP_ORDER) {
    if (seq.length <= count) break;
    const idx = seq.indexOf(role);
    if (idx !== -1) seq.splice(idx, 1);
  }
  return seq.slice(0, count);
}

const SYSTEM_PROMPT = `You are Kogni's content strategist. Structure an Instagram carousel as a JSON array of slides.

Each slide object must have: "headline" (max 8 words, punchy) and "body" (max 22 words, clear supporting copy).
Match the requested tone and audience. The narrative must flow logically from hook to conclusion.
Return ONLY a valid JSON array, no markdown fences, no commentary.`;

export async function structureCarousel(params: CarouselStructureParams): Promise<SlideOutline[]> {
  const roles = roleSequence(params.slideCount);

  if (isMockAiMode()) {
    return roles.map((role, i) => mockSlide(role, i + 1, params.topic));
  }

  const provider = await getTextGenerationProvider();
  const result = await provider.generate({
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify({
      topic: params.topic,
      audience: params.audience ?? "general audience",
      tone: params.tone ?? "professional and educational",
      slides: roles.map((role, i) => ({ position: i + 1, role })),
    }),
    temperature: 0.8,
    maxTokens: 1200,
  });

  try {
    const parsed = JSON.parse(stripFences(result.text)) as Array<{ headline: string; body: string }>;
    return roles.map((role, i) => ({
      position: i + 1,
      role,
      headline: parsed[i]?.headline ?? mockSlide(role, i + 1, params.topic).headline,
      body: parsed[i]?.body ?? mockSlide(role, i + 1, params.topic).body,
    }));
  } catch {
    // If the model returns malformed JSON, degrade gracefully instead of failing the whole request.
    return roles.map((role, i) => mockSlide(role, i + 1, params.topic));
  }
}

function stripFences(text: string): string {
  return text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
}

const ROLE_LABELS: Record<SlideRole, string> = {
  hook: "Hook",
  problem: "The Problem",
  context: "Context",
  insight: "Key Insight",
  example: "Example",
  solution: "The Solution",
  cta: "Take Action",
  conclusion: "Conclusion",
};

function mockSlide(role: SlideRole, position: number, topic: string): SlideOutline {
  return {
    position,
    role,
    headline: `${ROLE_LABELS[role]}: ${topic.slice(0, 40)}`,
    body: `Slide ${position} — ${role} beat exploring "${topic}" for your audience.`,
  };
}
