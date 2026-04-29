import { getStripe } from "@/lib/stripe-server";
import { stripePriceIdForInterval } from "@/lib/stripe-price-env";

/** Weeks per average month (52 / 12) for “price / week” on a monthly plan. */
const WEEKS_PER_MONTH = 52 / 12;

export type SubscribePricingDisplay = {
  currency: string;
  monthlyPerWeekFormatted: string;
  annualPerWeekFormatted: string;
  monthlyBilledFormatted: string;
  annualBilledFormatted: string;
  /** Dollar amount saved vs twelve monthly payments at the current monthly price */
  annualSaveVsMonthlyFormatted: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Loads recurring amounts from Stripe for the configured price IDs.
 * Returns null if IDs/env are missing or Stripe errors (page still works without amounts).
 */
export async function getSubscribePricingDisplay(): Promise<SubscribePricingDisplay | null> {
  const monthlyId = stripePriceIdForInterval("month");
  const annualId = stripePriceIdForInterval("year");
  if (!monthlyId || !annualId) return null;

  try {
    const stripe = getStripe();
    const [pMonth, pYear] = await Promise.all([
      stripe.prices.retrieve(monthlyId),
      stripe.prices.retrieve(annualId),
    ]);

    const monthlyCents =
      typeof pMonth.unit_amount === "number" ? pMonth.unit_amount : null;
    const annualCents = typeof pYear.unit_amount === "number" ? pYear.unit_amount : null;
    if (monthlyCents == null || annualCents == null) return null;

    const currency = (pMonth.currency || pYear.currency || "usd").toLowerCase();

    /** Round to integer cents so per-week display never implies the wrong monthly total. */
    const monthlyPerWeekCents = Math.round(monthlyCents / WEEKS_PER_MONTH);
    const annualPerWeekCents = Math.round(annualCents / 52);

    const yearIfMonthly = 12 * monthlyCents;
    const annualSaveCents = Math.max(0, yearIfMonthly - annualCents);

    return {
      currency,
      monthlyPerWeekFormatted: formatMoney(monthlyPerWeekCents, currency),
      annualPerWeekFormatted: formatMoney(annualPerWeekCents, currency),
      monthlyBilledFormatted: formatMoney(monthlyCents, currency),
      annualBilledFormatted: formatMoney(annualCents, currency),
      annualSaveVsMonthlyFormatted: formatMoney(annualSaveCents, currency),
    };
  } catch {
    return null;
  }
}
