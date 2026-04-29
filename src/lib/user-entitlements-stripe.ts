import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Subscription metadata ships from web (`supabase_user_id`) or mobile (`supabaseUserId`).
 * Same Stripe account is shared across clients.
 */
export function stripeSubscriptionMetadataUserId(
  metadata: Stripe.Metadata | null | undefined,
): string | null {
  if (!metadata) return null;
  const snake = metadata.supabase_user_id?.trim();
  const camel = metadata.supabaseUserId?.trim();
  return snake || camel || null;
}

export function subscriptionCurrentPeriodEndIso(sub: Stripe.Subscription): string | null {
  const subAny = sub as unknown as Stripe.Subscription & { current_period_end?: unknown };
  const raw = subAny.current_period_end;
  const sec = typeof raw === "number" ? raw : null;
  return sec ? new Date(sec * 1000).toISOString() : null;
}

export type UpsertStripeEntitlementArgs = {
  userId: string;
  isSubscriber: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

/**
 * Source of truth for membership (aligned with Awake&Align mobile API + Stripe webhooks there).
 */
export async function upsertStripeUserEntitlement(args: UpsertStripeEntitlementArgs): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: args.userId,
      is_subscriber: args.isSubscriber,
      provider: "stripe",
      stripe_customer_id: args.stripeCustomerId,
      stripe_subscription_id: args.stripeSubscriptionId,
      current_period_end: args.currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("[user_entitlements] upsert failed", error);
    throw new Error(error.message);
  }
}
