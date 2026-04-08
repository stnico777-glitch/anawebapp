"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

export type MovementLayoutVideoPayload = {
  title: string;
  subtitle?: string;
  videoUrl: string;
  poster?: string | null;
};

export default function MovementLayoutVideoOverlay({
  payload,
  onClose,
}: {
  payload: MovementLayoutVideoPayload;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only: createPortal needs document.body (same pattern as MovementWorkoutPlayerOverlay).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount gate for SSR
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const poster = payload.poster?.trim() || WEEKLY_DAY_CARD_IMAGES[0];

  const node = (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-app-surface"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-layout-video-title"
    >
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:py-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex items-center text-sm text-gray transition hover:text-foreground [font-family:var(--font-body),sans-serif]"
        >
          ← Back to Movement
        </button>
        <h1
          id="movement-layout-video-title"
          className="text-2xl font-medium text-foreground [font-family:var(--font-headline),sans-serif]"
        >
          {payload.title}
        </h1>
        {payload.subtitle ? (
          <p className="mt-1 text-sm lowercase tracking-[0.12em] text-gray [font-family:var(--font-body),sans-serif]">
            {payload.subtitle}
          </p>
        ) : null}
        <div className="mt-6 movement-overlay-player-fade">
          <VideoPlayer src={payload.videoUrl} poster={poster} title={payload.title} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="movement-overlay-player-fade movement-overlay-player-fade-delay mt-8 w-full rounded-sm bg-sky-blue py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface [font-family:var(--font-body),sans-serif]"
        >
          Finish
        </button>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
