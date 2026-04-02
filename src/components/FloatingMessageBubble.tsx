"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "awake-align-welcome-modal-seen";
const REOPEN_EVENT = "awake-align-reopen-welcome";

export default function FloatingMessageBubble() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const check = () => {
      setVisible(sessionStorage.getItem(STORAGE_KEY) === "1");
    };
    check();
    const onStorage = () => check();
    const onReopen = () => {
      setVisible(false);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(REOPEN_EVENT, onReopen);
    const id = setInterval(check, 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(REOPEN_EVENT, onReopen);
      clearInterval(id);
    };
  }, [mounted]);

  const handleClick = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-sand transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
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
          d="M12 3v1.5m0 0V3m0 0c-4.97 0-9 4.03-9 9 0 2.25.75 4.33 2 6l1.5 1.5M12 3c4.97 0 9 4.03 9 9 0 2.25-.75 4.33-2 6l-1.5 1.5M12 21v-1.5m0 1.5V21m0 0c4.97 0 9-4.03 9-9 0-2.25-.75-4.33-2-6l-1.5-1.5M12 21c-4.97 0-9-4.03-9-9 0-2.25.75-4.33 2-6l1.5-1.5"
        />
      </svg>
    </button>
  );
}
