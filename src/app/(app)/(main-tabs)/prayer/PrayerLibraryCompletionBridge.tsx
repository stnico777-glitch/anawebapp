"use client";

import { useCallback, useEffect } from "react";
import { usePrayerLibraryAudio } from "./PrayerLibraryAudioContext";

/** Registers prayer completion with the shared audio context (replaces inline PrayerPlayer when no preview card). */
export default function PrayerLibraryCompletionBridge({
  prayerId,
  isCompleted,
  isLocked,
}: {
  prayerId: string;
  isCompleted: boolean;
  isLocked: boolean;
}) {
  const { registerOnComplete } = usePrayerLibraryAudio();

  const handleComplete = useCallback(async () => {
    if (isCompleted || isLocked) return;
    await fetch(`/api/prayer/${prayerId}/complete`, { method: "POST" });
  }, [prayerId, isCompleted, isLocked]);

  useEffect(() => {
    if (isLocked) {
      registerOnComplete(null);
      return;
    }
    registerOnComplete(() => {
      void handleComplete();
    });
    return () => registerOnComplete(null);
  }, [registerOnComplete, handleComplete, isLocked]);

  return null;
}
