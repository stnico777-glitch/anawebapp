"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "awake-align-hero-chirps-v6";
const SRC = "/sounds/bird-chirps.mp3";
const PLAY_DURATION_MS = 3000;
const VOLUME = 0.32;
/** Ramp volume from 0 → {@link VOLUME} over this duration after play starts. */
const FADE_IN_MS = 1000;

/** Bird chirps once per session on first click; volume fades in over {@link FADE_IN_MS}. */
export default function HeroWelcomeChirps() {
  const playedRef = useRef(false);
  const startingRef = useRef(false);
  const capRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode */
    }

    const markDone = () => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    };

    let fadeRafId: number | null = null;

    const stop = () => {
      if (fadeRafId != null) {
        cancelAnimationFrame(fadeRafId);
        fadeRafId = null;
      }
      if (capRef.current) {
        clearTimeout(capRef.current);
        capRef.current = null;
      }
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = "";
        el.load();
        audioRef.current = null;
      }
    };

    const fadeInVolume = (audio: HTMLAudioElement) => {
      audio.volume = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const linear = Math.min(1, (now - start) / FADE_IN_MS);
        // Ease-in so the rise feels natural (quiet → full).
        const t = linear * linear;
        audio.volume = VOLUME * t;
        if (linear < 1) {
          fadeRafId = requestAnimationFrame(tick);
        } else {
          fadeRafId = null;
        }
      };
      fadeRafId = requestAnimationFrame(tick);
    };

    const onFirstClick = () => {
      if (playedRef.current || startingRef.current) return;
      try {
        if (window.sessionStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* ignore */
      }

      startingRef.current = true;
      const audio = new Audio(SRC);
      audio.volume = 0;
      audio.preload = "auto";
      const a = audio as HTMLAudioElement & { playsInline?: boolean };
      a.playsInline = true;

      void audio
        .play()
        .then(() => {
          startingRef.current = false;
          playedRef.current = true;
          markDone();
          removeListener();
          audioRef.current = audio;
          fadeInVolume(audio);
          capRef.current = window.setTimeout(stop, PLAY_DURATION_MS);
          audio.addEventListener(
            "ended",
            () => {
              stop();
            },
            { once: true },
          );
        })
        .catch(() => {
          startingRef.current = false;
        });
    };

    const removeListener = () => {
      window.removeEventListener("click", onFirstClick, true);
    };

    window.addEventListener("click", onFirstClick, { capture: true, passive: true });

    return () => {
      removeListener();
      stop();
    };
  }, []);

  return null;
}
