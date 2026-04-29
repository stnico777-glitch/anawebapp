import Link from "next/link";
import { auth } from "@/auth";
import SubscribeSuccessRefresh from "./SubscribeSuccessRefresh";

/** Always fetch fresh — fulfillment runs every load (via the client action). */
export const dynamic = "force-dynamic";

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: checkoutSessionId } = await searchParams;
  const sessionIdTrimmed = checkoutSessionId?.trim() ?? "";
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        Welcome
      </h1>
      <p className="text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
        We are glad you are here. Your membership is on its way: confirmation usually takes just a moment, then your
        full access unlocks automatically.
      </p>
      {sessionIdTrimmed ? (
        <SubscribeSuccessRefresh checkoutSessionId={sessionIdTrimmed} />
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
      {!signedIn ? (
        <p className="text-sm text-gray [font-family:var(--font-body),sans-serif]">
          Your membership is active. If your tabs still look locked,{" "}
          <Link href="/login" className="font-medium text-sky-blue hover:underline">
            sign in
          </Link>{" "}
          with the email you used at checkout to attach this device.
        </p>
      ) : null}
    </div>
  );
}
