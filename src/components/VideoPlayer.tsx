"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { claimVideoPlayback, releaseVideoPlayback } from "@/lib/video-playback-guard";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  onComplete,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const p = (video.currentTime / video.duration) * 100;
    setProgress(p);
    onProgress?.(p);
    if (p >= 95) onComplete?.();
  }, [onComplete, onProgress]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(100);
    onComplete?.();
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

  return (
    <div className="overflow-hidden rounded-sm bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="aspect-video w-full"
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={(e) => {
          claimVideoPlayback(e.currentTarget);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
      />
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
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-sm bg-sand/50">
            <div
              className="h-full bg-sky-blue transition-all"
              style={{ width: `${progress}%` }}
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
