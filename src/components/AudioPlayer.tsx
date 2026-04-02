"use client";

import { useRef, useState, useCallback } from "react";

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
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationState, setDurationState] = useState(duration);

  const progress = durationState > 0 ? (currentTime / durationState) * 100 : 0;

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDurationState(audio.duration || duration);
    if (audio.currentTime / (audio.duration || 1) >= 0.95) onComplete?.();
  }, [duration, onComplete]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
    onComplete?.();
  }, [onComplete]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const p = parseFloat(e.target.value);
    audio.currentTime = (p / 100) * audio.duration;
    setCurrentTime(audio.currentTime);
  }, []);

  return (
    <div className="rounded-sm border border-sand bg-white p-4">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDurationState(e.currentTarget.duration)}
      />
      {!hideTitle ? <p className="mb-3 font-medium text-foreground">{title}</p> : null}
      <div className="flex items-center gap-3">
        <button
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
            value={progress}
            onChange={handleSeek}
            className="h-2 w-full cursor-pointer appearance-none rounded-sm bg-sand [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-sky-blue"
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
