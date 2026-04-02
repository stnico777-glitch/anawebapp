"use client";

import { useRef, useCallback } from "react";

const START_TIME = 1.5; // skip first 1.5 seconds

type PrayerCardVideoProps = {
  className?: string;
};

export default function PrayerCardVideo({ className = "" }: PrayerCardVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <video
      ref={videoRef}
      src="/prayer-video.mp4"
      className={`h-full w-full object-cover ${className}`.trim()}
      muted
      loop
      playsInline
      autoPlay
      aria-hidden
      onCanPlay={onCanPlay}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
    />
  );
}
