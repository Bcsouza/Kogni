// Provider-agnostic contract for image generation. The rest of the application
// (API routes, services, UI) must depend only on these types and on
// `getImageGenerationProvider()` — never on a concrete provider SDK directly.
// This is what lets us swap OpenAI for another model (e.g. Nano Banana) later
// without touching application code.

export interface ImageGenerationParams {
  /** Final, enhanced prompt ready to send to the model. */
  prompt: string;
  /** Pixel width of the requested output. */
  width: number;
  /** Pixel height of the requested output. */
  height: number;
  /** Number of variations to generate in one call. */
  count?: number;
  /** Free-form style hint (e.g. "minimalist", "premium", "photographic"). */
  style?: string;
  /** Rendering quality tier — provider maps this to its own quality params. */
  quality?: "draft" | "standard" | "high";
  /** Things to steer the model away from, where supported. */
  negativePrompt?: string;
  /** Deterministic seed, where supported. */
  seed?: number;
  /** Reference image (base64 data URL) for edits / image-to-image, where supported. */
  referenceImage?: string;
}

export interface GeneratedImage {
  /** Publicly fetchable URL, or a data: URL for providers that return raw bytes. */
  url: string;
  width: number;
  height: number;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  provider: string;
  model: string;
  metadata?: Record<string, unknown>;
}

export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "rate_limited"
      | "invalid_request"
      | "provider_unavailable"
      | "content_blocked"
      | "unknown" = "unknown",
    public readonly retryable: boolean = false,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ImageGenerationError";
  }
}

export interface ImageGenerationProvider {
  /** Stable identifier used in persisted records, e.g. "openai", "mock". */
  readonly id: string;
  /** Human-readable model identifier reported back to the caller. */
  readonly model: string;
  generate(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}

// --- Text generation (copy, carousel structuring, prompt enhancement) ---
// Kept as a separate, equally provider-agnostic contract so a future swap of
// the text model doesn't ripple through the app either.

export interface TextGenerationParams {
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  /** When set, the provider is asked to return JSON matching this shape description. */
  jsonSchemaHint?: string;
}

export interface TextGenerationResult {
  text: string;
  provider: string;
  model: string;
}

export interface TextGenerationProvider {
  readonly id: string;
  readonly model: string;
  generate(params: TextGenerationParams): Promise<TextGenerationResult>;
}
