"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const WelcomeMessageBubble = dynamic(() => import("@/components/WelcomeMessageBubble"), {
  ssr: false,
  loading: () => null,
});

const FloatingMessageBubble = dynamic(() => import("@/components/FloatingMessageBubble"), {
  ssr: false,
  loading: () => null,
});

/**
 * Loads chat marketing bubbles after idle or once the user scrolls past ~the hero band,
 * so the first below-the-fold paint isn’t competing with heavy client trees.
 */
export default function DeferredMarketingBubbles() {
  const [show, setShow] = useState(false);
  const doneRef = useRef(false);
  const idleIdRef = useRef<number | null>(null);
  const usedIdleCallbackRef = useRef(false);

  useEffect(() => {
    /** Warm the WelcomeMessageBubble chunk on idle so the first open (intersection or
     * reopen tap) doesn't wait on a round-trip before the entrance animation starts. */
    const prefetchChunks = () => {
      void import("@/components/WelcomeMessageBubble");
      void import("@/components/FloatingMessageBubble");
    };
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(prefetchChunks, { timeout: 2500 });
    } else {
      window.setTimeout(prefetchChunks, 800);
    }

    let scrollHandler: (() => void) | null = null;

    const cancelScheduledReveal = () => {
      const id = idleIdRef.current;
      if (id == null) return;
      if (usedIdleCallbackRef.current && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
      idleIdRef.current = null;
    };

    const detachScroll = () => {
      if (!scrollHandler) return;
      window.removeEventListener("scroll", scrollHandler);
      scrollHandler = null;
    };

    const reveal = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      detachScroll();
      cancelScheduledReveal();
      setShow(true);
    };

    scrollHandler = () => {
      const vh = window.innerHeight;
      if (window.scrollY > Math.min(vh * 0.38, 480)) reveal();
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
    scrollHandler();

    if (typeof window.requestIdleCallback === "function") {
      usedIdleCallbackRef.current = true;
      idleIdRef.current = window.requestIdleCallback(reveal, { timeout: 2000 });
    } else {
      usedIdleCallbackRef.current = false;
      idleIdRef.current = window.setTimeout(reveal, 600) as unknown as number;
    }

    return () => {
      detachScroll();
      cancelScheduledReveal();
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <WelcomeMessageBubble />
      <FloatingMessageBubble />
    </>
  );
}
