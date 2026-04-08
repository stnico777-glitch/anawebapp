"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CatalogCoverImage } from "@/lib/prayer-audio-display";

const FAVORITES_STORAGE_KEY = "prayer-audio-favorites";

export type PrayerLibraryTrack = {
  prayerId: string;
  src: string;
  title: string;
  subtitle: string;
  duration: number;
  coverSrc: string;
  coverUnoptimized: boolean;
  locked: boolean;
};

type PrayerLibraryAudioContextValue = {
  track: PrayerLibraryTrack | null;
  setTrack: (t: PrayerLibraryTrack | null) => void;
  clearTrack: () => void;
  playing: boolean;
  currentTime: number;
  durationState: number;
  togglePlay: () => void;
  seekPercent: (percent: number) => void;
  registerOnComplete: (fn: (() => void) | null) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const PrayerLibraryAudioContext = createContext<PrayerLibraryAudioContextValue | null>(null);

function readFavoriteIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeFavoriteIds(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function usePrayerLibraryAudioOptional() {
  return useContext(PrayerLibraryAudioContext);
}

export function usePrayerLibraryAudio(): PrayerLibraryAudioContextValue {
  const ctx = useContext(PrayerLibraryAudioContext);
  if (!ctx) {
    throw new Error("usePrayerLibraryAudio must be used within PrayerLibraryAudioProvider");
  }
  return ctx;
}

export function PrayerLibraryAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const completionFiredRef = useRef(false);
  const [track, setTrackState] = useState<PrayerLibraryTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationState, setDurationState] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(readFavoriteIds);

  const setTrack = useCallback((t: PrayerLibraryTrack | null) => {
    completionFiredRef.current = false;
    setTrackState(t);
    if (!t) {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
      setPlaying(false);
      setCurrentTime(0);
      setDurationState(0);
    }
  }, []);

  const clearTrack = useCallback(() => setTrack(null), [setTrack]);

  const registerOnComplete = useCallback((fn: (() => void) | null) => {
    onCompleteRef.current = fn;
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!track?.src || track.locked) {
      a.pause();
      a.removeAttribute("src");
      a.load();
      setPlaying(false);
      setCurrentTime(0);
      return;
    }
    a.src = track.src;
    a.load();
    const playAttempt = a.play();
    if (playAttempt !== undefined) {
      playAttempt.catch(() => {
        /* autoplay blocked — user uses play button */
      });
    }
  }, [track?.prayerId, track?.src, track?.locked]);

  /** Smooth progress: read currentTime every frame while playing (timeupdate is too sparse). */
  useEffect(() => {
    if (!playing) return;
    let rafId = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        const dur = audio.duration || 1;
        if (dur > 0 && audio.currentTime / dur >= 0.95 && !completionFiredRef.current) {
          completionFiredRef.current = true;
          onCompleteRef.current?.();
        }
        if (Number.isFinite(audio.duration)) {
          setDurationState(audio.duration);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDurationState(Number.isFinite(audio.duration) ? audio.duration : 0);
    if (audio.paused) {
      setCurrentTime(audio.currentTime);
    }
    const dur = audio.duration || 1;
    if (audio.currentTime / dur >= 0.95 && !completionFiredRef.current) {
      completionFiredRef.current = true;
      onCompleteRef.current?.();
    }
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
    if (!completionFiredRef.current) {
      completionFiredRef.current = true;
      onCompleteRef.current?.();
    }
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || track?.locked) return;
    if (a.paused) {
      void a.play();
    } else {
      a.pause();
    }
  }, [track?.locked]);

  const seekPercent = useCallback((percent: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0 || track?.locked) return;
    a.currentTime = (percent / 100) * a.duration;
    setCurrentTime(a.currentTime);
  }, [track?.locked]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavoriteIds(next);
      return next;
    });
  }, []);

  const value = useMemo<PrayerLibraryAudioContextValue>(
    () => ({
      track,
      setTrack,
      clearTrack,
      playing,
      currentTime,
      durationState,
      togglePlay,
      seekPercent,
      registerOnComplete,
      isFavorite,
      toggleFavorite,
    }),
    [
      track,
      setTrack,
      clearTrack,
      playing,
      currentTime,
      durationState,
      togglePlay,
      seekPercent,
      registerOnComplete,
      isFavorite,
      toggleFavorite,
    ],
  );

  return (
    <PrayerLibraryAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDurationState(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          const a = audioRef.current;
          if (a) setCurrentTime(a.currentTime);
        }}
      />
      {children}
    </PrayerLibraryAudioContext.Provider>
  );
}

export function PrayerLibraryLayoutPadding({ children }: { children: ReactNode }) {
  const ctx = usePrayerLibraryAudioOptional();
  const showBar = Boolean(ctx?.track && !ctx.track.locked);
  return (
    <div
      className={
        showBar
          ? "pb-[min(5.75rem,calc(5.25rem+env(safe-area-inset-bottom)))]"
          : undefined
      }
    >
      {children}
    </div>
  );
}

export function PrayerLibraryInlineScrubber() {
  const ctx = usePrayerLibraryAudioOptional();
  if (!ctx) return null;
  const { playing, currentTime, durationState, seekPercent, togglePlay } = ctx;
  const progress = durationState > 0 ? (currentTime / durationState) * 100 : 0;

  return (
    <div className="rounded-sm border border-sand bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-sky-blue text-white hover:bg-sky-blue/90"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => seekPercent(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-sm bg-sand [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-sky-blue"
            aria-label="Seek"
          />
          <div className="mt-1 flex justify-between text-xs text-gray">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationState)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrayerMiniPlayerBar() {
  const ctx = usePrayerLibraryAudioOptional();
  if (!ctx) return null;
  const {
    track,
    playing,
    currentTime,
    durationState,
    seekPercent,
    togglePlay,
    toggleFavorite,
    isFavorite,
  } = ctx;

  if (!track || track.locked) return null;

  const dur = durationState > 0 ? durationState : track.duration;
  const progress = dur > 0 ? (currentTime / dur) * 100 : 0;
  const fav = isFavorite(track.prayerId);

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-[100] border-t border-sand bg-gradient-to-r from-app-surface via-white to-sunset-peach shadow-[0_-8px_28px_rgba(120,130,135,0.18)] [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Now playing"
    >
      {/* Seekable progress: solid track + fill + thumb; invisible range for click/drag */}
      <div className="relative w-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-sky-blue focus-within:ring-offset-0">
        <div className="relative mx-auto h-1.5 w-full max-w-full">
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full bg-sand shadow-[inset_0_1px_1px_rgba(120,130,135,0.18)]"
            aria-hidden
          >
            <div
              className="h-full rounded-l-full bg-sky-blue"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          {/* Playhead — slightly larger than bar for grab visibility */}
          <div
            className="pointer-events-none absolute top-1/2 z-[5] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-blue shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
            style={{ left: `${Math.min(100, Math.max(0, progress))}%` }}
            aria-hidden
          />
          <input
            type="range"
            min={0}
            max={100}
            step={0.05}
            value={progress}
            onChange={(e) => seekPercent(parseFloat(e.target.value))}
            className="absolute -inset-y-2.5 inset-x-0 z-10 cursor-pointer opacity-0 [appearance:none]"
            aria-label="Seek audio position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 md:gap-4 md:px-6">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-blue text-white shadow-sm transition hover:bg-sky-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-sand ring-1 ring-sand shadow-sm">
          <CatalogCoverImage
            src={track.coverSrc}
            unoptimized={track.coverUnoptimized}
            className="object-cover"
            sizes="48px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
            {track.title}
          </p>
          <p className="truncate text-xs text-gray [font-family:var(--font-body),sans-serif]">
            {track.subtitle}
          </p>
          <p className="mt-0.5 text-[11px] tabular-nums text-muted">
            {formatTime(currentTime)} / {formatTime(dur)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(track.prayerId)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface ${
            fav ? "text-accent-pink" : "text-gray hover:text-accent-pink/90"
          }`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={fav}
        >
          {fav ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
