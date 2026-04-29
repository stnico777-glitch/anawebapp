import Link from "next/link";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { syncProfileFromCheckoutSessionIfOwner } from "@/lib/stripe-profile-subscription";
import SubscribeSuccessRefresh from "./SubscribeSuccessRefresh";

/** Always fetch fresh — the inline fulfillment must run on every load. */
export const dynamic = "force-dynamic";

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: checkoutSessionId } = await searchParams;
  const session = await auth();
  const sessionIdTrimmed = checkoutSessionId?.trim() ?? "";

  let syncError: string | null = null;
  if (sessionIdTrimmed) {
    /**
     * Run fulfillment from the Stripe session's metadata, not the cookie session.
     * Stripe redirects the user back to `success_url` from `NEXT_PUBLIC_SITE_URL`, which
     * may be a different origin than the one they signed up on (e.g. localhost dev →
     * prod redirect), so the cookie session is often empty here. The Stripe session id
     * is itself proof of who paid.
     */
    try {
      await syncProfileFromCheckoutSessionIfOwner(
        sessionIdTrimmed,
        session?.user?.id ?? null,
      );
      revalidatePath("/", "layout");
    } catch (e) {
      console.error("[subscribe/success] checkout sync failed", e);
      syncError = e instanceof Error ? e.message : "Unknown error";
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      {sessionIdTrimmed ? (
        <SubscribeSuccessRefresh checkoutSessionId={sessionIdTrimmed} />
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        Welcome
      </h1>
      <p className="text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
        We are glad you are here. Your membership is on its way: confirmation usually takes just a moment, then your
        full access unlocks automatically. If anything still looks limited, wait a few seconds, refresh, or come back
        to this page.
      </p>
      {syncError ? (
        <div
          className="rounded-md border border-accent-pink/40 bg-accent-pink/5 px-3 py-2 text-xs text-accent-pink [font-family:var(--font-body),sans-serif]"
          role="alert"
        >
          We saved your payment with Stripe but ran into a hiccup linking it to your account.
          Please refresh in a moment, or contact support if access is still locked.
          <span className="mt-1 block opacity-70">Reference: {syncError}</span>
        </div>
      ) : null}
      <div>
        <Link
          href="/schedule"
          prefetch={false}
          className="inline-flex items-center justify-center rounded-sm bg-sky-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-blue/90"
        >
          Go to app
        </Link>
      </div>
      {!session?.user?.id ? (
        <p className="text-sm text-gray [font-family:var(--font-body),sans-serif]">
          You may need to{" "}
          <Link href="/login" className="font-medium text-sky-blue hover:underline">
            sign in
          </Link>{" "}
          with the same email you used at checkout so your membership links to this account.
        </p>
      ) : null}
    </div>
  );
}
