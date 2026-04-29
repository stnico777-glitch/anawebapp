"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { syncProfileFromCheckoutSessionIfOwner } from "@/lib/stripe-profile-subscription";

export type FulfillCheckoutResult =
  | { ok: true; signedIn: boolean }
  | { ok: false; error: string };

/**
 * Run on mount of the success page so `revalidatePath` is invoked from a Server Action
 * (calling it during a Server Component render is unsupported in Next.js v16).
 *
 * Drives fulfillment off the Stripe Checkout Session's `metadata.supabase_user_id`
 * (or `client_reference_id`) — the cookie session may be empty when the user crossed
 * origins (e.g. signed up on localhost, returned from Stripe to the prod URL).
 * Knowing a `session_id` is itself proof of who paid, so we trust it.
 */
export async function fulfillCheckoutAction(
  checkoutSessionId: string,
): Promise<FulfillCheckoutResult> {
  const trimmed = checkoutSessionId.trim();
  if (!trimmed) return { ok: false, error: "missing_session_id" };

  try {
    const session = await auth();
    await syncProfileFromCheckoutSessionIfOwner(trimmed, session?.user?.id ?? null);
    revalidatePath("/", "layout");
    return { ok: true, signedIn: Boolean(session?.user?.id) };
  } catch (e) {
    console.error("[subscribe/success] fulfill action failed", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown_error" };
  }
}
