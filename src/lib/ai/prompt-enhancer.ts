import "server-only";
import { getTextGenerationProvider, isMockAiMode } from "@/lib/ai/provider";

const SYSTEM_PROMPT = `You are Kogni's prompt engineer for a premium AI creative studio. Rewrite the user's short idea into a single, richly detailed image-generation prompt.

Always specify: composition, lighting, color palette, typography treatment (if text is implied), photographic/illustrative quality, and overall mood. Keep the brand feel minimalist, premium and modern unless the user says otherwise. Return ONLY the rewritten prompt text, no preamble, no quotes.`;

/**
 * Turns a short user idea into a detailed, production-quality prompt.
 * Falls back to a deterministic local enhancement in mock mode so the UI
 * flow is fully testable without any provider call.
 */
export async function enhancePrompt(rawPrompt: string, style?: string): Promise<string> {
  if (isMockAiMode()) {
    return localEnhance(rawPrompt, style);
  }

  const provider = await getTextGenerationProvider();
  const result = await provider.generate({
    system: SYSTEM_PROMPT,
    prompt: style ? `${rawPrompt}\n\nStyle preference: ${style}` : rawPrompt,
    temperature: 0.7,
    maxTokens: 400,
  });

  return result.text.trim() || rawPrompt;
}

function localEnhance(rawPrompt: string, style?: string): string {
  const styleLine = style ? ` Style: ${style}, ` : " Style: minimalist, premium, ";
  return (
    `${rawPrompt.trim()}.${styleLine}modern typography, professional composition, ` +
    `balanced negative space, high production value, clean lighting, sharp focus, consistent color palette.`
  );
}
