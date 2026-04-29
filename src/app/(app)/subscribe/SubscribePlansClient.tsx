"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { SubscribePricingDisplay } from "@/lib/stripe-subscribe-pricing";

type Interval = "month" | "year";

/** Annual vs paying monthly for a year — marketing figure (see product pricing). */
const ANNUAL_SAVE_PERCENT_LABEL = "Save 46%";

export default function SubscribePlansClient({
  isSubscriber,
  hasStripeCustomer,
  pricesConfigured,
  pricing,
}: {
  isSubscriber: boolean;
  hasStripeCustomer: boolean;
  pricesConfigured: boolean;
  pricing: SubscribePricingDisplay | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const [loading, setLoading] = useState<Interval | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (interval: Interval) => {
    setError(null);
    setLoading(interval);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }, []);

  const openPortal = useCallback(async () => {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  }, []);

  if (isSubscriber) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-sm border border-sand bg-white p-8 shadow-sm ring-1 ring-sand/80">
        <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
          You&apos;re subscribed
        </h2>
        <p className="text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
          Your membership is active. Open the app tabs to use audio, schedule, and movement with full access.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center rounded-sm bg-sky-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-blue/90"
          >
            Go to schedule
          </Link>
          {hasStripeCustomer ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={loading === "portal"}
              className="inline-flex items-center justify-center rounded-sm border border-sand bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background disabled:opacity-50"
            >
              {loading === "portal" ? "Opening…" : "Manage billing"}
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {!pricesConfigured ? (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 [font-family:var(--font-body),sans-serif]">
          <p className="font-medium">Stripe price IDs are not set on this server yet.</p>
          <p className="mt-2 leading-relaxed">
            In{" "}
            <a
              href="https://dashboard.stripe.com/products"
              className="font-medium text-sky-blue underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Stripe → Product catalog
            </a>
            , open your membership product, copy the recurring{" "}
            <strong className="font-semibold">Price</strong> IDs (one for monthly, one for annual — they start with{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">price_</code>), then add them to{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">.env.local</code> (local) or Vercel env
            (production):
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
            <li>
              <code className="rounded bg-white/80 px-1 py-0.5">STRIPE_PRICE_ID_MONTHLY</code> and{" "}
              <code className="rounded bg-white/80 px-1 py-0.5">STRIPE_PRICE_ID_YEARLY</code>
            </li>
            <li className="text-amber-900/90">
              Or reuse the same keys as your mobile app, e.g.{" "}
              <code className="rounded bg-white/80 px-1 py-0.5">EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID</code> /{" "}
              <code className="rounded bg-white/80 px-1 py-0.5">EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID</code>
            </li>
          </ul>
          <p className="mt-2 text-xs text-amber-900/90">
            Restart <code className="rounded bg-white/80 px-1">npm run dev</code> after changing env, or redeploy on
            Vercel.
          </p>
        </div>
      ) : null}
      {canceled ? (
        <p className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 [font-family:var(--font-body),sans-serif]">
          Checkout was canceled. Choose a plan below when you&apos;re ready.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 [font-family:var(--font-body),sans-serif]">
          {error}
        </p>
      ) : null}

      <div className="rounded-sm border border-sand bg-white p-6 shadow-sm ring-1 ring-sand/80">
        <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
          Choose your plan
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
          Full library access after checkout. Prices match your live Stripe products.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Monthly */}
          <div className="flex flex-col rounded-sm border border-sand bg-gradient-to-b from-white to-app-surface/80 p-5 ring-1 ring-sand/60">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                Monthly
              </p>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 [font-family:var(--font-body),sans-serif]">
                Billed monthly
              </span>
            </div>
            {pricing ? (
              <>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
                  {pricing.monthlyBilledFormatted}
                  <span className="text-base font-medium text-gray">/mo</span>
                </p>
                <p className="mt-1 text-xs text-gray [font-family:var(--font-body),sans-serif]">
                  {pricing.monthlyPerWeekFormatted}/week · about 4.3 weeks per month
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray [font-family:var(--font-body),sans-serif]">
                Billed every month. Price loads from Stripe when configured.
              </p>
            )}
            <button
              type="button"
              onClick={() => void startCheckout("month")}
              disabled={loading !== null || !pricesConfigured}
              className="mt-5 w-full rounded-sm bg-sky-blue py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-blue/90 disabled:opacity-50"
            >
              {loading === "month" ? "Redirecting…" : "Continue — Monthly"}
            </button>
          </div>

          {/* Annual */}
          <div className="flex flex-col rounded-sm border-2 border-sky-blue/40 bg-gradient-to-b from-sky-blue/[0.06] to-white p-5 shadow-[0_4px_20px_rgba(110,173,228,0.12)]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                Annual
              </p>
              {pricing ? (
                <span className="shrink-0 rounded-full bg-sky-blue px-2.5 py-0.5 text-xs font-semibold text-white [font-family:var(--font-body),sans-serif]">
                  {ANNUAL_SAVE_PERCENT_LABEL}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-sky-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sky-blue [font-family:var(--font-body),sans-serif]">
                  Best value
                </span>
              )}
            </div>
            {pricing ? (
              <>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
                  {pricing.annualBilledFormatted}
                  <span className="text-base font-medium text-gray">/yr</span>
                </p>
                <p className="mt-1 text-xs text-gray [font-family:var(--font-body),sans-serif]">
                  {pricing.annualPerWeekFormatted}/week · save {pricing.annualSaveVsMonthlyFormatted} vs twelve monthly
                  payments
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray [font-family:var(--font-body),sans-serif]">
                One payment per year. Price loads from Stripe when configured.
              </p>
            )}
            <button
              type="button"
              onClick={() => void startCheckout("year")}
              disabled={loading !== null || !pricesConfigured}
              className="mt-5 w-full rounded-sm border-2 border-sky-blue bg-white py-3 text-sm font-semibold text-sky-blue transition hover:bg-sky-blue/5 disabled:opacity-50"
            >
              {loading === "year" ? "Redirecting…" : "Continue — Annual"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray [font-family:var(--font-body),sans-serif]">
        After paying, Stripe will send you back here; it may take a few seconds for access to turn on.{" "}
        <button type="button" className="font-medium text-sky-blue underline-offset-2 hover:underline" onClick={() => router.refresh()}>
          Refresh status
        </button>
      </p>
    </div>
  );
}
