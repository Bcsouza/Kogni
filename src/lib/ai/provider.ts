import "server-only";
import type { ImageGenerationProvider, TextGenerationProvider } from "@/lib/ai/types";
import { MockImageProvider, MockTextProvider } from "@/lib/ai/providers/mock";

// Single seam the rest of the app talks to. Nothing outside /lib/ai should
// import a concrete provider class — always go through these two functions.
//
// To add a new provider (e.g. Nano Banana):
//   1. Implement ImageGenerationProvider / TextGenerationProvider in
//      /lib/ai/providers/<name>.ts
//   2. Add a branch below keyed off an env var
// No other file in the application needs to change.

let imageProvider: ImageGenerationProvider | null = null;
let textProvider: TextGenerationProvider | null = null;

function isMockMode(): boolean {
  return process.env.MOCK_AI_PROVIDER === "true" || !process.env.OPENAI_API_KEY;
}

export async function getImageGenerationProvider(): Promise<ImageGenerationProvider> {
  if (imageProvider) return imageProvider;

  if (isMockMode()) {
    imageProvider = new MockImageProvider();
    return imageProvider;
  }

  switch (process.env.AI_IMAGE_PROVIDER ?? "openai") {
    case "openai": {
      // Dynamic import so the OpenAI SDK is never initialized in mock mode.
      const { OpenAIImageProvider } = await import("@/lib/ai/providers/openai");
      imageProvider = new OpenAIImageProvider(process.env.OPENAI_API_KEY!);
      return imageProvider;
    }
    default:
      throw new Error(`Unknown AI_IMAGE_PROVIDER: ${process.env.AI_IMAGE_PROVIDER}`);
  }
}

export async function getTextGenerationProvider(): Promise<TextGenerationProvider> {
  if (textProvider) return textProvider;

  if (isMockMode()) {
    textProvider = new MockTextProvider();
    return textProvider;
  }

  switch (process.env.AI_TEXT_PROVIDER ?? "openai") {
    case "openai": {
      const { OpenAITextProvider } = await import("@/lib/ai/providers/openai");
      textProvider = new OpenAITextProvider(process.env.OPENAI_API_KEY!);
      return textProvider;
    }
    default:
      throw new Error(`Unknown AI_TEXT_PROVIDER: ${process.env.AI_TEXT_PROVIDER}`);
  }
}

export function isMockAiMode(): boolean {
  return isMockMode();
}
