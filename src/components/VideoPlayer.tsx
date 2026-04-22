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
  /** When true, attempt `video.play()` as soon as data is ready. Defaults to `false`
   *  so the user presses the play button themselves — the video is pre-buffered by
   *  the `<link rel="preload">` hints, so their tap starts playback instantly. */
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  onComplete,
  onProgress,
  preload: preloadProp,
  fetchPriority,
  autoPlay = false,
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
  /** True when we had to fall back to muted autoplay (Safari / iOS typically).
   *  Used to render a "Tap to unmute" affordance over the video. */
  const [mutedAutoplay, setMutedAutoplay] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setBufferReady(hasPoster);
    setMutedAutoplay(false);
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

  /** When a `<link rel="preload">` has already warmed the cache, `loadeddata` /
   *  `canplay` can fire before React attaches the listener. Check readyState
   *  directly after mount so we never get stuck behind a phantom spinner. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.readyState >= 2 /* HAVE_CURRENT_DATA */) {
      setBufferReady(true);
    }
  }, [src]);

  /** Autoplay with audio when allowed, fall back to muted autoplay with a
   *  "Tap to unmute" affordance otherwise. Matches the Instagram / TikTok /
   *  YouTube Shorts pattern — always some kind of autoplay, audio restored
   *  with one tap on browsers that block audible autoplay (Safari, iOS). */
  useEffect(() => {
    if (!autoPlay) return;
    const el = videoRef.current;
    if (!el || !bufferReady || loadError) return;
    if (!el.paused) return;

    let cancelled = false;
    const attemptAudible = async () => {
      try {
        el.muted = false;
        await el.play();
        if (!cancelled) setMutedAutoplay(false);
      } catch {
        if (cancelled) return;
        // Audible blocked — try muted as fallback (always allowed modern browsers).
        try {
          el.muted = true;
          await el.play();
          if (!cancelled) setMutedAutoplay(true);
        } catch {
          /* Even muted was blocked (rare). Video stays paused; user can tap play. */
        }
      }
    };
    void attemptAudible();

    return () => {
      cancelled = true;
    };
  }, [autoPlay, bufferReady, loadError, src]);

  const unmute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    setMutedAutoplay(false);
    // If somehow paused, resume — the unmute tap is a fresh user gesture.
    if (el.paused) void el.play().catch(() => {});
  }, []);

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
        {mutedAutoplay && !loadError && (
          <button
            type="button"
            onClick={unmute}
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black [font-family:var(--font-body),sans-serif]"
            aria-label="Unmute video"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
            </svg>
            Tap to unmute
          </button>
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
          onCanPlayThrough={markBufferReady}
          onPlaying={markBufferReady}
          onError={() => {
            setLoadError(true);
            setBufferReady(true);
          }}
          onPlay={(e) => {
            claimVideoPlayback(e.currentTarget);
            markBufferReady();
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
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            if (playing) {
              el.pause();
            } else {
              // Tapping play is a fresh user gesture — restore audio if we were in
              // the muted-autoplay fallback state.
              if (el.muted) {
                el.muted = false;
                setMutedAutoplay(false);
              }
              void el.play().catch(() => {});
            }
          }}
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
