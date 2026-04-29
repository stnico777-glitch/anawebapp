/**
 * Resolve Stripe recurring Price IDs for subscription checkout.
 * Supports several env names so you can match mobile / Expo without renaming keys.
 */

const MONTHLY_ENV_KEYS = [
  "STRIPE_PRICE_ID_MONTHLY",
  /** Same as `Awake&Align` apps/web checkout */
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_MONTHLY_PRICE_ID",
  "EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID",
  "EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY",
] as const;

const YEARLY_ENV_KEYS = [
  "STRIPE_PRICE_ID_YEARLY",
  /** Same as `Awake&Align` apps/web checkout (`ANNUAL` = yearly) */
  "STRIPE_PRICE_ANNUAL",
  "STRIPE_YEARLY_PRICE_ID",
  "STRIPE_PRICE_YEARLY",
  "STRIPE_ANNUAL_PRICE_ID",
  "EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID",
  "EXPO_PUBLIC_STRIPE_ANNUAL_PRICE_ID",
  "EXPO_PUBLIC_STRIPE_PRICE_ID_YEARLY",
] as const;

function firstTrimmed(keys: readonly string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function stripePriceIdForInterval(interval: "month" | "year"): string | undefined {
  return interval === "month"
    ? firstTrimmed(MONTHLY_ENV_KEYS)
    : firstTrimmed(YEARLY_ENV_KEYS);
}

export function stripeSubscriptionPriceIdsConfigured(): boolean {
  return Boolean(stripePriceIdForInterval("month") && stripePriceIdForInterval("year"));
}
