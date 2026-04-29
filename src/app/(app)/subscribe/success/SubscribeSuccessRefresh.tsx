"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Ensures prefetched shells refetch membership after Stripe return (paired with prefetch={false} on Links). */
export default function SubscribeSuccessRefresh({
  checkoutSessionId,
}: {
  checkoutSessionId: string;
}) {
  const router = useRouter();
  const didRefresh = useRef(false);

  useEffect(() => {
    if (!checkoutSessionId.trim() || didRefresh.current) return;
    didRefresh.current = true;
    router.refresh();
  }, [checkoutSessionId, router]);

  return null;
}
