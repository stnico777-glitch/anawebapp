"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";
import LockIcon from "@/components/LockIcon";
import {
  PrayerLibraryInlineScrubber,
  usePrayerLibraryAudioOptional,
} from "./PrayerLibraryAudioContext";

interface PrayerPlayerProps {
  prayerId: string;
  src: string;
  title: string;
  duration: number;
  description?: string;
  scripture?: string;
  isCompleted: boolean;
  isLocked?: boolean;
  /** When false, only player controls (title/context shown by parent). */
  showMeta?: boolean;
  hidePlayerTitle?: boolean;
}

export default function PrayerPlayer({
  prayerId,
  src,
  title,
  duration,
  description,
  scripture,
  isCompleted,
  isLocked = false,
  showMeta = true,
  hidePlayerTitle = false,
}: PrayerPlayerProps) {
  const libraryAudio = usePrayerLibraryAudioOptional();

  const handleComplete = useCallback(async () => {
    if (isCompleted || isLocked) return;
    await fetch(`/api/prayer/${prayerId}/complete`, { method: "POST" });
  }, [prayerId, isCompleted, isLocked]);

  useEffect(() => {
    if (!libraryAudio || isLocked) {
      libraryAudio?.registerOnComplete(null);
      return;
    }
    const run = () => {
      void handleComplete();
    };
    libraryAudio.registerOnComplete(run);
    return () => libraryAudio.registerOnComplete(null);
  }, [libraryAudio, isLocked, handleComplete]);

  const useSharedLibraryPlayer = Boolean(libraryAudio && !isLocked);

  return (
    <div className={`relative rounded-sm border border-sand bg-white p-4 ${showMeta ? "" : "pt-4"}`}>
      {isLocked && (
        <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-sm bg-white/95 shadow ring-1 ring-sand" title="Subscribe to unlock">
          <LockIcon size="sm" />
        </span>
      )}
      {showMeta ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="min-w-0 text-sm font-medium text-gray">
            {scripture && <span className="italic">{scripture}</span>}
            {scripture && description && " • "}
            {description}
          </span>
          {isCompleted && !isLocked && (
            <span className="shrink-0 text-sm text-sky-blue">✓ Completed</span>
          )}
        </div>
      ) : (
        isCompleted &&
        !isLocked && (
          <div className="mb-2 flex justify-end">
            <span className="text-sm text-sky-blue">✓ Completed</span>
          </div>
        )
      )}
      {isLocked ? (
        <div className="flex flex-col gap-2 py-2">
          <p className="text-sm text-gray">Subscribe to unlock prayer & audio.</p>
          <Link href="/subscribe" className="inline-block text-sm font-medium text-sky-blue hover:text-sky-blue/80 hover:underline">
            View plans →
          </Link>
        </div>
      ) : useSharedLibraryPlayer ? (
        <PrayerLibraryInlineScrubber />
      ) : (
        <AudioPlayer
          src={src}
          title={title}
          duration={duration}
          onComplete={handleComplete}
          hideTitle={hidePlayerTitle}
        />
      )}
    </div>
  );
}
