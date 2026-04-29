import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-server";
import {
  stripeSubscriptionMetadataUserId,
  subscriptionCurrentPeriodEndIso,
  upsertStripeUserEntitlement,
} from "@/lib/user-entitlements-stripe";

function subscriptionStatusIsLive(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

function subscriptionIdFromSession(session: Stripe.Checkout.Session): string | null {
  const raw = session.subscription;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "id" in raw) return (raw as Stripe.Subscription).id;
  return null;
}

/**
 * Whether this subscription should unlock the app (including $0 / 100% coupon checkouts).
 * `incomplete` + paid invoice happens briefly before Stripe moves the sub to `active`.
 */
export async function subscriptionGrantsAccess(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<boolean> {
  if (subscriptionStatusIsLive(subscription.status)) return true;

  /** `incomplete_expired` means the customer never completed payment — do not unlock. */
  if (subscription.status === "incomplete") {
    const liRef = subscription.latest_invoice;
    try {
      const inv: Stripe.Invoice | null =
        typeof liRef === "string"
          ? await stripe.invoices.retrieve(liRef)
          : liRef && typeof liRef === "object"
            ? liRef
            : null;
      if (inv?.status === "paid") return true;
    } catch {
      /* ignore */
    }
  }

  return false;
}

async function mirrorEntitlementsThenProfile(args: {
  userId: string;
  active: boolean;
  customerId: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}): Promise<void> {
  await upsertStripeUserEntitlement({
    userId: args.userId,
    isSubscriber: args.active,
    stripeCustomerId: args.customerId,
    stripeSubscriptionId: args.stripeSubscriptionId,
    currentPeriodEnd: args.currentPeriodEnd,
  });

  await prisma.profile.upsert({
    where: { id: args.userId },
    create: {
      id: args.userId,
      isSubscriber: args.active,
      stripeCustomerId: args.customerId,
    },
    update: {
      isSubscriber: args.active,
      stripeCustomerId: args.customerId,
    },
  });
}

export async function syncProfileFromSubscription(subscription: Stripe.Subscription) {
  const stripe = getStripe();
  const customerIdRaw = subscription.customer;
  const customerId =
    typeof customerIdRaw === "string" ? customerIdRaw : customerIdRaw?.id;
  if (!customerId) {
    console.warn("[stripe] syncProfileFromSubscription: missing stripe customer id", {
      subscriptionId: subscription.id,
    });
    return;
  }

  const active = await subscriptionGrantsAccess(stripe, subscription);
  const userId =
    stripeSubscriptionMetadataUserId(subscription.metadata)?.trim() || null;

  const periodEnd = subscriptionCurrentPeriodEndIso(subscription);
  const stripeSubscriptionId = subscription.id;

  if (userId) {
    await mirrorEntitlementsThenProfile({
      userId,
      active,
      customerId,
      stripeSubscriptionId,
      currentPeriodEnd: periodEnd,
    });
    return;
  }

  await prisma.profile.updateMany({
    where: { stripeCustomerId: customerId },
    data: { isSubscriber: active },
  });

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("user_entitlements")
    .update({
      is_subscriber: active,
      stripe_subscription_id: stripeSubscriptionId,
      current_period_end: periodEnd,
    })
    .eq("stripe_customer_id", customerId);
  if (error) {
    console.error("[user_entitlements] update by stripe_customer_id failed", error);
    throw new Error(error.message);
  }
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const p = invoice.parent;
  if (p?.type === "subscription_details" && p.subscription_details?.subscription) {
    const s = p.subscription_details.subscription;
    return typeof s === "string" ? s : s.id;
  }
  const legacy = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const sub = legacy.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

/** Sync subscriber flag from a finalized/paid subscription invoice (includes $0 invoices). */
export async function syncProfileFromInvoice(invoice: Stripe.Invoice) {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) {
    console.warn("[stripe] invoice event has no subscription id; profile sync skipped", {
      invoiceId: invoice.id,
    });
    return;
  }
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subId, {
    expand: ["latest_invoice"],
  });
  await syncProfileFromSubscription(subscription);
}

/**
 * Fulfill membership after Checkout completes (paid, no payment required, or $0 total / 100% promo).
 */
export async function syncProfileFromCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;
  const userIdRaw =
    session.metadata?.supabase_user_id?.trim() ??
    session.metadata?.supabaseUserId?.trim() ??
    session.client_reference_id?.trim();
  const userId = userIdRaw?.trim();
  if (!userId) {
    console.error("[stripe] checkout session missing supabase user id");
    return;
  }

  const subId = subscriptionIdFromSession(session);
  if (!subId) {
    console.error("[stripe] checkout session missing subscription id");
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subId, {
    expand: ["latest_invoice"],
  });

  const customerIdRaw = session.customer;
  const customerId =
    typeof customerIdRaw === "string" ? customerIdRaw : customerIdRaw?.id;
  if (!customerId) {
    console.error("[stripe] checkout session missing stripe customer id", {
      checkoutSessionId: session.id,
    });
    return;
  }

  const amountTotal = session.amount_total ?? null;
  const zeroTotalCompleted =
    session.status === "complete" &&
    session.mode === "subscription" &&
    amountTotal === 0;

  const checkoutPaymentOk =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required" ||
    zeroTotalCompleted;

  const accessGranted =
    checkoutPaymentOk || (await subscriptionGrantsAccess(stripe, subscription));

  const stripeSubscriptionId = subscription.id;

  await upsertStripeUserEntitlement({
    userId,
    isSubscriber: accessGranted,
    stripeCustomerId: customerId,
    stripeSubscriptionId,
    currentPeriodEnd: subscriptionCurrentPeriodEndIso(subscription),
  });

  await prisma.profile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      isSubscriber: accessGranted,
      stripeCustomerId: customerId,
    },
    update: {
      isSubscriber: accessGranted,
      stripeCustomerId: customerId,
    },
  });

  if (!accessGranted) {
    console.warn("[stripe] checkout synced profile but access not granted yet", {
      checkoutSessionId: session.id,
      userId,
      payment_status: session.payment_status,
      subscription_status: subscription.status,
    });
  }
}

/**
 * When the user lands on success with `session_id`, re-apply fulfillment if the Checkout Session
 * belongs to them. Covers delayed/missing webhooks and 100% off (no "transaction" in Dashboard).
 *
 * If `appUserId` is null we still fulfill — the Stripe session's `metadata.supabase_user_id` /
 * `client_reference_id` is the source of truth for *who* paid. This matters when the success-page
 * redirect lands on a different origin than the one the user signed up on (e.g. NEXT_PUBLIC_SITE_URL
 * points at prod while the checkout was started from localhost), so the cookie session is missing.
 * Knowing a `session_id` is itself proof of having just completed checkout — Stripe ids are
 * unguessable random tokens, so this is safe to act on.
 */
export async function syncProfileFromCheckoutSessionIfOwner(
  checkoutSessionId: string,
  appUserId: string | null,
): Promise<void> {
  const stripe = getStripe();
  const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["subscription"],
  });
  if (cs.mode !== "subscription" || cs.status !== "complete") {
    console.warn("[stripe] success-page sync skipped: session not ready", {
      checkoutSessionId,
      mode: cs.mode,
      status: cs.status,
    });
    return;
  }
  const ownerRaw =
    cs.metadata?.supabase_user_id?.trim() ??
    cs.metadata?.supabaseUserId?.trim() ??
    cs.client_reference_id?.trim() ??
    "";
  const owner = ownerRaw.trim();
  if (!owner) {
    console.error("[stripe] success-page sync skipped: checkout has no supabase user id", {
      checkoutSessionId,
    });
    return;
  }
  if (appUserId && owner !== appUserId) {
    console.warn("[stripe] success-page sync skipped: checkout belongs to another user", {
      checkoutSessionId,
      owner,
      appUserId,
    });
    return;
  }
  await syncProfileFromCheckoutSession(cs);
}
