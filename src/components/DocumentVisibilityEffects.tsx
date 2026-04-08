"use client";

import { useEffect } from "react";

/** Applied to `<html>` while the document is hidden — see `globals.css` for paused selectors. */
const DOC_HIDDEN_PAUSE_CLASS = "doc-hidden-pause-animations";

export default function DocumentVisibilityEffects() {
  useEffect(() => {
    const sync = () => {
      const hidden = document.visibilityState !== "visible";
      document.documentElement.classList.toggle(DOC_HIDDEN_PAUSE_CLASS, hidden);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      document.documentElement.classList.remove(DOC_HIDDEN_PAUSE_CLASS);
    };
  }, []);
  return null;
}
