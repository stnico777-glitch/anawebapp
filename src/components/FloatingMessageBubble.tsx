"use client";

import { useState, useEffect } from "react";
import {
  WELCOME_MODAL_SEEN_KEY,
  WELCOME_REOPEN_EVENT,
  WELCOME_BUBBLE_NUDGE_KEY,
  WELCOME_BUBBLE_SUCCESS_KEY,
  WELCOME_BUBBLE_PILL_DISMISSED_KEY,
} from "@/lib/welcome-email-modal";

const NUDGE_TEXT =
  "Still want the free trial link? Tap here to add your email.";

const SUCCESS_TEXT =
  "You’re in! Your free trial link is on the way — tap anytime to open this chat.";

export default function FloatingMessageBubble() {
  const [visible, setVisible] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pillDismissed, setPillDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const check = () => {
      setVisible(sessionStorage.getItem(WELCOME_MODAL_SEEN_KEY) === "1");
      setShowSuccess(sessionStorage.getItem(WELCOME_BUBBLE_SUCCESS_KEY) === "1");
      setShowNudge(sessionStorage.getItem(WELCOME_BUBBLE_NUDGE_KEY) === "1");
      setPillDismissed(sessionStorage.getItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY) === "1");
    };
    check();
    const onStorage = () => check();
    const onReopen = () => {
      setVisible(false);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(WELCOME_REOPEN_EVENT, onReopen);
    const id = setInterval(check, 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(WELCOME_REOPEN_EVENT, onReopen);
      clearInterval(id);
    };
  }, [mounted]);

  const handleClick = () => {
    sessionStorage.removeItem(WELCOME_MODAL_SEEN_KEY);
    sessionStorage.removeItem(WELCOME_BUBBLE_NUDGE_KEY);
    sessionStorage.removeItem(WELCOME_BUBBLE_SUCCESS_KEY);
    sessionStorage.removeItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY);
    setShowNudge(false);
    setShowSuccess(false);
    setPillDismissed(false);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(WELCOME_REOPEN_EVENT));
  };

  const handleDismissPill = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY, "1");
    setPillDismissed(true);
  };

  const showPill = (showSuccess || showNudge) && !pillDismissed;

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-[55] flex max-w-[min(260px,calc(100vw-3rem))] flex-col items-start gap-2"
      role="region"
      aria-label="Message from Kat"
    >
      {showPill && (
        <div
          className={[
            "relative w-full rounded-2xl border py-2.5 pl-10 pr-3.5 text-sm leading-snug text-gray shadow-[0_4px_16px_rgba(120,130,135,0.1)]",
            "bg-gradient-to-br from-app-surface via-sunset-peach/80 to-background",
            "font-[family-name:var(--font-body),sans-serif]",
            showSuccess
              ? "border-sky-blue/35 ring-1 ring-sky-blue/25"
              : "border-sand ring-1 ring-sand/60",
          ].join(" ")}
          role="status"
        >
          <button
            type="button"
            onClick={handleDismissPill}
            className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-sand/60 hover:text-gray focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
            aria-label="Dismiss message"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {showSuccess ? SUCCESS_TEXT : NUDGE_TEXT}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-sand transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
        aria-label="Open message from Kat"
      >
        <svg
          className="h-7 w-7 text-sky-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1.5m0 0V3m0 0c-4.97 0-9 4.03-9 9 0 2.25.75 4.33 2 6l1.5 1.5M12 3c4.97 0 9 4.03 9 9 0 2.25-.75 4.33-2 6l-1.5-1.5M12 21v-1.5m0 1.5V21m0 0c4.97 0 9-4.03 9-9 0-2.25-.75-4.33-2-6l-1.5-1.5M12 21c-4.97 0-9-4.03-9-9 0-2.25.75-4.33 2-6l1.5-1.5"
          />
        </svg>
      </button>
    </div>
  );
}
