import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "project-assets";

/**
 * Persists a generated image (data: URL or remote URL) into Supabase
 * Storage under the owning user's folder and returns the public URL.
 * Provider results are ephemeral (some providers return short-lived URLs or
 * raw base64) — this is the only place that makes them durable.
 */
export async function persistGeneratedImage(params: {
  userId: string;
  projectId: string;
  source: string;
  index: number;
}): Promise<string> {
  const { userId, projectId, source, index } = params;
  const supabase = createServiceRoleClient();

  const bytes = await toBytes(source);
  const path = `${userId}/${projectId}/${crypto.randomUUID()}-${index}.png`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/png",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function toBytes(source: string): Promise<Uint8Array> {
  if (source.startsWith("data:")) {
    const base64 = source.split(",")[1] ?? "";
    return Buffer.from(base64, "base64");
  }

  const response = await fetch(source);
  if (!response.ok) throw new Error(`Failed to fetch generated image: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
