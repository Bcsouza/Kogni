import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PlanId } from "@/types";

export const PLAN_CREDITS: Record<PlanId, number> = {
  free: 100,
  pro: 1000,
  business: 5000,
};

export const GENERATION_COST = {
  image: 5,
  carouselSlide: 4,
  variation: 5,
} as const;

export class InsufficientCreditsError extends Error {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient credits: have ${balance}, need ${required}.`);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Reads the user's credit balance from the append-only ledger. This is the
 * only source of truth for credits — never trust a client-supplied balance.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.amount, 0);
}

/**
 * Atomically checks and debits credits for a generation. Throws
 * InsufficientCreditsError if the user can't afford it — call this before
 * doing any provider work so failed checks never touch the AI provider.
 */
export async function reserveCredits(
  userId: string,
  amount: number,
  reason: string,
  projectId?: string,
): Promise<void> {
  const balance = await getCreditBalance(userId);
  if (balance < amount) {
    throw new InsufficientCreditsError(balance, amount);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: -amount,
    reason,
    project_id: projectId ?? null,
  });

  if (error) throw error;
}

/** Refunds credits after a failed generation so users are never charged for errors. */
export async function refundCredits(userId: string, amount: number, reason: string, projectId?: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    reason: `refund:${reason}`,
    project_id: projectId ?? null,
  });

  if (error) throw error;
}
