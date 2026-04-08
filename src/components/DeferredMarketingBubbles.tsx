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

  const reveal = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setShow(true);
  };

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      if (window.scrollY > Math.min(vh * 0.38, 480)) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let idleId: number;
    let usedIdleCallback = false;
    if (typeof window.requestIdleCallback === "function") {
      usedIdleCallback = true;
      idleId = window.requestIdleCallback(reveal, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(reveal, 600) as unknown as number;
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (usedIdleCallback && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
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
