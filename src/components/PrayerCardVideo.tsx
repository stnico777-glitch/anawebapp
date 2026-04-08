"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { claimVideoPlayback, releaseVideoPlayback } from "@/lib/video-playback-guard";

const START_TIME = 1.5; // skip first 1.5 seconds

type PrayerCardVideoProps = {
  className?: string;
};

export default function PrayerCardVideo({ className = "" }: PrayerCardVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loadSrc, setLoadSrc] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadSrc(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => releaseVideoPlayback(videoRef.current);
  }, []);

  const onCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime < START_TIME) {
      video.currentTime = START_TIME;
    }
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime < START_TIME) {
      video.currentTime = START_TIME;
    }
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime < START_TIME) {
      video.currentTime = START_TIME;
    }
  }, []);

  return (
    <div ref={wrapRef} className={`h-full w-full ${className}`.trim()}>
      {loadSrc ? (
        <video
          ref={videoRef}
          src="/prayer-video.mp4"
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          aria-hidden
          onCanPlay={onCanPlay}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={(e) => claimVideoPlayback(e.currentTarget)}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-b from-sand/50 to-sand/20" aria-hidden />
      )}
    </div>
  );
}
