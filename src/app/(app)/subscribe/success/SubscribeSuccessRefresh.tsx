"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fulfillCheckoutAction } from "./actions";

type Status = "pending" | "ok" | "error";

/**
 * On mount, ask the server to link the Stripe checkout to the user's profile.
 * Done from a Server Action (not a render) so `revalidatePath` is legal.
 * After fulfillment, `router.refresh()` repopulates the layout's session/header
 * and the user's locked tabs unlock without a manual sign-in.
 */
export default function SubscribeSuccessRefresh({
  checkoutSessionId,
}: {
  checkoutSessionId: string;
}) {
  const router = useRouter();
  const ran = useRef(false);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = checkoutSessionId.trim();
    if (!id || ran.current) return;
    ran.current = true;

    let cancelled = false;
    void (async () => {
      const result = await fulfillCheckoutAction(id);
      if (cancelled) return;
      if (result.ok) {
        setStatus("ok");
        router.refresh();
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId, router]);

  if (status === "error") {
    return (
      <div
        className="rounded-md border border-accent-pink/40 bg-accent-pink/5 px-3 py-2 text-xs text-accent-pink [font-family:var(--font-body),sans-serif]"
        role="alert"
      >
        We saved your payment with Stripe but ran into a hiccup linking it to your account.
        Please refresh in a moment, or contact support if access is still locked.
        {errorMsg ? <span className="mt-1 block opacity-70">Reference: {errorMsg}</span> : null}
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className="rounded-md border border-sand bg-sand/40 px-3 py-2 text-xs text-gray [font-family:var(--font-body),sans-serif]"
        role="status"
        aria-live="polite"
      >
        Activating your membership&hellip;
      </div>
    );
  }

  return null;
}
