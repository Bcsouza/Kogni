import "server-only";
import {
  ImageGenerationError,
  type GeneratedImage,
  type ImageGenerationParams,
  type ImageGenerationProvider,
  type ImageGenerationResult,
  type TextGenerationParams,
  type TextGenerationProvider,
  type TextGenerationResult,
} from "@/lib/ai/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deterministic placeholder SVG so mock mode never depends on network access. */
function placeholderSvg(width: number, height: number, seed: number, label: string): string {
  const hue = seed % 360;
  const hue2 = (hue + 40) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue} 55% 14%)" />
        <stop offset="100%" stop-color="hsl(${hue2} 45% 8%)" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.25}" fill="hsl(${hue} 60% 50% / 0.15)" />
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${Math.max(14, Math.min(width, height) * 0.05)}" fill="white" opacity="0.85">${label}</text>
    <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${Math.max(10, Math.min(width, height) * 0.03)}" fill="white" opacity="0.5">Kogni mock preview — ${width}×${height}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export class MockImageProvider implements ImageGenerationProvider {
  readonly id = "mock";
  readonly model = "kogni-mock-v1";

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    await sleep(900 + Math.random() * 600);

    if (/\bfail\b/i.test(params.prompt)) {
      throw new ImageGenerationError(
        "Mock provider simulated a failure because the prompt contained 'fail'.",
        "unknown",
        true,
      );
    }

    const count = params.count ?? 1;
    const seedBase = params.seed ?? Math.floor(Math.random() * 100000);
    const images: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
      url: placeholderSvg(params.width, params.height, seedBase + i * 37, params.style ?? "Kogni"),
      width: params.width,
      height: params.height,
    }));

    return {
      images,
      provider: this.id,
      model: this.model,
      metadata: { mock: true, prompt: params.prompt },
    };
  }
}

export class MockTextProvider implements TextGenerationProvider {
  readonly id = "mock";
  readonly model = "kogni-mock-text-v1";

  async generate(params: TextGenerationParams): Promise<TextGenerationResult> {
    await sleep(400 + Math.random() * 400);
    return {
      text: `Mock response for: ${params.prompt.slice(0, 120)}`,
      provider: this.id,
      model: this.model,
    };
  }
}
