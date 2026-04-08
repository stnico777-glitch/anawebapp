"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { claimVideoPlayback, releaseVideoPlayback } from "@/lib/video-playback-guard";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function VideoLoadingSpinner() {
  return (
    <div className="relative h-10 w-10" aria-hidden>
      <span className="absolute inset-0 rounded-full border-2 border-white/15" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-blue border-r-sky-blue/40 motion-reduce:animate-none" />
    </div>
  );
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  /** Overrides default: poster → metadata, else auto */
  preload?: "none" | "metadata" | "auto";
  /** Hint for the browser when competing for bandwidth (e.g. schedule workout). */
  fetchPriority?: "high" | "low" | "auto";
}

export default function VideoPlayer({
  src,
  poster,
  title,
  onComplete,
  onProgress,
  preload: preloadProp,
  fetchPriority,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubbingRef = useRef(false);
  const rafRef = useRef(0);
  const completeGateRef = useRef(false);
  const lastOnProgressEmitRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const hasPoster = Boolean(poster?.trim());
  const [bufferReady, setBufferReady] = useState(hasPoster);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setBufferReady(hasPoster);
    completeGateRef.current = false;
  }, [src, hasPoster]);

  useEffect(() => {
    const onUp = () => {
      scrubbingRef.current = false;
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  /** Drive progress from video.currentTime every animation frame while playing — smoother than `timeupdate` (~4Hz). */
  const syncProgressFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    const p = Math.min(100, Math.max(0, (video.currentTime / d) * 100));
    setProgress(p);

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastOnProgressEmitRef.current >= 100) {
      lastOnProgressEmitRef.current = now;
      onProgress?.(p);
    }

    if (p >= 95) {
      if (!completeGateRef.current) {
        completeGateRef.current = true;
        onComplete?.();
      }
    } else {
      completeGateRef.current = false;
    }
  }, [onComplete, onProgress]);

  useEffect(() => {
    if (!playing) return;

    const tick = () => {
      if (!scrubbingRef.current) {
        const video = videoRef.current;
        if (video && !video.paused && !video.ended) {
          syncProgressFromVideo();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, syncProgressFromVideo]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(100);
    if (!completeGateRef.current) {
      completeGateRef.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    return () => {
      releaseVideoPlayback(videoRef.current);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const seekPercent = useCallback((pct: number) => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    const clamped = Math.min(100, Math.max(0, pct));
    video.currentTime = (clamped / 100) * d;
    setProgress(clamped);
    if (clamped < 95) completeGateRef.current = false;
  }, []);

  const progressDisplay = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));

  const markBufferReady = useCallback(() => {
    setBufferReady(true);
  }, []);

  const preloadAttr = preloadProp ?? (hasPoster ? "metadata" : "auto");

  useEffect(() => {
    const el = videoRef.current;
    if (!el || fetchPriority == null) return;
    el.setAttribute("fetchpriority", fetchPriority);
  }, [fetchPriority, src]);

  return (
    <div className="overflow-hidden rounded-sm bg-black">
      <div className="relative aspect-video w-full bg-black">
        {!hasPoster && !bufferReady && !loadError && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black"
            aria-busy="true"
            aria-label="Loading video"
          >
            <VideoLoadingSpinner />
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black px-4 text-center text-sm text-white/80 [font-family:var(--font-body),sans-serif]">
            Couldn&apos;t load this video. Check the link or try again later.
          </div>
        )}
        <video
          ref={videoRef}
          src={src}
          poster={hasPoster ? poster : undefined}
          className={`absolute inset-0 h-full w-full object-contain ${
            !hasPoster
              ? `transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                  bufferReady || reducedMotion || loadError ? "opacity-100" : "opacity-0"
                }`
              : ""
          }`}
          playsInline
          preload={preloadAttr}
          onEnded={handleEnded}
          onLoadedData={markBufferReady}
          onCanPlay={markBufferReady}
          onError={() => {
            setLoadError(true);
            setBufferReady(true);
          }}
          onPlay={(e) => {
            claimVideoPlayback(e.currentTarget);
            setPlaying(true);
          }}
          onPause={(e) => {
            if (!scrubbingRef.current) {
              const v = e.currentTarget;
              const d = v.duration;
              if (Number.isFinite(d) && d > 0) {
                const p = Math.min(100, Math.max(0, (v.currentTime / d) * 100));
                setProgress(p);
              }
            }
            setPlaying(false);
          }}
          onSeeked={() => {
            if (scrubbingRef.current) return;
            const video = videoRef.current;
            if (!video) return;
            const d = video.duration;
            if (!Number.isFinite(d) || d <= 0) return;
            const p = Math.min(100, Math.max(0, (video.currentTime / d) * 100));
            setProgress(p);
          }}
        />
      </div>
      <div className="flex items-center gap-2 bg-foreground px-3 py-2">
        <button
          onClick={() => videoRef.current?.[playing ? "pause" : "play"]()}
          className="rounded-sm bg-sky-blue p-2 text-white hover:bg-sky-blue/90"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="relative min-w-0 flex-1 px-0.5 py-1 focus-within:ring-2 focus-within:ring-sky-blue focus-within:ring-offset-2 focus-within:ring-offset-foreground">
          <div className="relative mx-auto h-1.5 w-full max-w-full">
            <div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full bg-sand shadow-[inset_0_1px_1px_rgba(120,130,135,0.18)]"
              aria-hidden
            >
              <div
                className="h-full rounded-l-full bg-sky-blue will-change-[width]"
                style={{ width: `${progressDisplay}%` }}
              />
            </div>
            <div
              className="pointer-events-none absolute top-1/2 z-[5] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-blue shadow-[0_1px_3px_rgba(0,0,0,0.22)] will-change-[left]"
              style={{ left: `${progressDisplay}%` }}
              aria-hidden
            />
            <input
              type="range"
              min={0}
              max={100}
              step={0.01}
              value={progressDisplay}
              onPointerDown={() => {
                scrubbingRef.current = true;
              }}
              onChange={(e) => seekPercent(parseFloat(e.target.value))}
              className="absolute -inset-y-2.5 inset-x-0 z-10 w-full cursor-pointer opacity-0 [appearance:none]"
              aria-label="Seek video position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressDisplay)}
            />
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="rounded-sm p-1.5 text-white/70 hover:bg-white/20 hover:text-white"
          aria-label="Fullscreen"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
