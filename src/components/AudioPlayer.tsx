"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration: number; // seconds
  onComplete?: () => void;
  /** Hide the title row (e.g. when title is shown in parent layout) */
  hideTitle?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  src,
  title,
  duration,
  onComplete,
  hideTitle = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrubbingRef = useRef(false);
  const rafRef = useRef(0);
  const completeGateRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationState, setDurationState] = useState(duration);

  const progress = durationState > 0 ? (currentTime / durationState) * 100 : 0;

  useEffect(() => {
    completeGateRef.current = false;
  }, [src]);

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

  useEffect(() => {
    if (!playing) return;

    const tick = () => {
      if (!scrubbingRef.current) {
        const audio = audioRef.current;
        if (audio && !audio.paused && !audio.ended) {
          setCurrentTime(audio.currentTime);
          const d = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
          if (d > 0) {
            const ratio = audio.currentTime / d;
            if (ratio >= 0.95) {
              if (!completeGateRef.current) {
                completeGateRef.current = true;
                onCompleteRef.current?.();
              }
            } else {
              completeGateRef.current = false;
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, duration]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
    if (!completeGateRef.current) {
      completeGateRef.current = true;
      onCompleteRef.current?.();
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const p = parseFloat(e.target.value);
    const d = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : durationState;
    if (d <= 0) return;
    audio.currentTime = (p / 100) * d;
    setCurrentTime(audio.currentTime);
    if (p < 95) completeGateRef.current = false;
  }, [durationState]);

  return (
    <div className="rounded-sm border border-sand bg-white p-4">
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDurationState(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={(e) => {
          setPlaying(false);
          setCurrentTime(e.currentTarget.currentTime);
        }}
      />
      {!hideTitle ? <p className="mb-3 font-medium text-foreground">{title}</p> : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => audioRef.current?.[playing ? "pause" : "play"]()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-sky-blue text-white hover:bg-sky-blue/90"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={100}
            step={0.01}
            value={progress}
            onPointerDown={() => {
              scrubbingRef.current = true;
            }}
            onChange={handleSeek}
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
