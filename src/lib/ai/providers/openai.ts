import "server-only";
import OpenAI from "openai";
import {
  ImageGenerationError,
  type ImageGenerationParams,
  type ImageGenerationProvider,
  type ImageGenerationResult,
  type TextGenerationParams,
  type TextGenerationProvider,
  type TextGenerationResult,
} from "@/lib/ai/types";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-5-mini";

/** Maps an arbitrary pixel size to the closest size OpenAI's image API accepts. */
function closestSupportedSize(width: number, height: number): "1024x1024" | "1024x1536" | "1536x1024" {
  const ratio = width / height;
  if (ratio > 1.15) return "1536x1024";
  if (ratio < 0.87) return "1024x1536";
  return "1024x1024";
}

function mapOpenAIError(error: unknown): ImageGenerationError {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return new ImageGenerationError("Rate limit reached on the image provider.", "rate_limited", true, {
        cause: error,
      });
    }
    if (error.status === 400) {
      return new ImageGenerationError(error.message ?? "Invalid generation request.", "invalid_request", false, {
        cause: error,
      });
    }
    if (error.status && error.status >= 500) {
      return new ImageGenerationError("The image provider is temporarily unavailable.", "provider_unavailable", true, {
        cause: error,
      });
    }
    if (error.code === "content_policy_violation") {
      return new ImageGenerationError("This request was blocked by content safety filters.", "content_blocked", false, {
        cause: error,
      });
    }
  }
  return new ImageGenerationError("Unexpected error from the image provider.", "unknown", true, {
    cause: error,
  });
}

export class OpenAIImageProvider implements ImageGenerationProvider {
  readonly id = "openai";
  readonly model = IMAGE_MODEL;
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    const size = closestSupportedSize(params.width, params.height);
    const quality = params.quality === "draft" ? "low" : params.quality === "high" ? "high" : "medium";

    try {
      const response = await this.client.images.generate({
        model: this.model,
        prompt: params.prompt,
        size,
        quality,
        n: params.count ?? 1,
      });

      const images = (response.data ?? []).map((item) => {
        const url = item.b64_json ? `data:image/png;base64,${item.b64_json}` : (item.url ?? "");
        return { url, width: params.width, height: params.height };
      });

      if (images.length === 0) {
        throw new ImageGenerationError("The provider returned no images.", "unknown", true);
      }

      return {
        images,
        provider: this.id,
        model: this.model,
        metadata: { size, quality },
      };
    } catch (error) {
      if (error instanceof ImageGenerationError) throw error;
      throw mapOpenAIError(error);
    }
  }
}

export class OpenAITextProvider implements TextGenerationProvider {
  readonly id = "openai";
  readonly model = TEXT_MODEL;
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(params: TextGenerationParams): Promise<TextGenerationResult> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        instructions: params.system,
        input: params.prompt,
        temperature: params.temperature,
        max_output_tokens: params.maxTokens,
      });

      return {
        text: response.output_text ?? "",
        provider: this.id,
        model: this.model,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError && error.status === 429) {
        throw new ImageGenerationError("Rate limit reached on the text provider.", "rate_limited", true, {
          cause: error,
        });
      }
      throw new ImageGenerationError("Unexpected error from the text provider.", "unknown", true, {
        cause: error,
      });
    }
  }
}
