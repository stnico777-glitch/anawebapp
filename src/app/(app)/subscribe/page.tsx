import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripeSubscriptionPriceIdsConfigured } from "@/lib/stripe-price-env";
import { getSubscribePricingDisplay } from "@/lib/stripe-subscribe-pricing";
import SubscribePlansClient from "./SubscribePlansClient";

export default async function SubscribePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          Membership
        </h1>
        <p className="text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
          Sign in to start or manage your subscription. New here? Create an account first, then sign in to complete
          checkout.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-sm bg-sky-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-blue/90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-sm border border-sand bg-white px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const paid = session.user.isSubscriber ?? false;
  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  const hasBilling = Boolean(profile?.stripeCustomerId?.trim());
  const pricesReady = stripeSubscriptionPriceIdsConfigured();
  const pricing = pricesReady ? await getSubscribePricingDisplay() : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        Membership
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
        Full access to audio, schedule, movement, and prayer journal requires an active subscription (admins bypass
        this check).
      </p>
      <div className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-gray [font-family:var(--font-body),sans-serif]">Loading…</p>}
        >
          <SubscribePlansClient
            isSubscriber={paid}
            hasStripeCustomer={hasBilling}
            pricesConfigured={pricesReady}
            pricing={pricing}
          />
        </Suspense>
      </div>
    </div>
  );
}
