"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PrayerAudioLibraryShell from "@/components/PrayerAudioLibraryShell";
import {
  PrayerLibraryAudioProvider,
  PrayerLibraryLayoutPadding,
  PrayerMiniPlayerBar,
  usePrayerLibraryAudio,
} from "./PrayerLibraryAudioContext";
import { type PrayerLibraryItem } from "@/lib/prayer-audio-display";
import {
  AUDIO_COLLECTION_CATEGORY_LABELS,
  type AudioCollectionCardDTO,
  type AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

export type { PrayerLibraryItem };

type PrayerAudioLibraryProps = {
  /** Library prayer rows are still fetched server-side (admin uses them) but the member view
   *  no longer renders them — kept on the props for shape stability with the page route. */
  prayers: PrayerLibraryItem[];
  completedIds: string[];
  isSubscriber: boolean;
  isGuest?: boolean;
  layout: {
    collections: AudioCollectionCardDTO[];
    essentials: AudioEssentialTileDTO[];
  };
};

function PrayerAudioLibraryInner({
  isSubscriber,
  isGuest = false,
  layout,
}: PrayerAudioLibraryProps) {
  const router = useRouter();
  /** Currently-playing collection card (Affirmations / Scripture / Meditations). Tracks the
   *  card id so multiple cards sharing the same placeholder mp3 still highlight correctly. */
  const [collectionActiveId, setCollectionActiveId] = useState<string | null>(null);
  const { setTrack } = usePrayerLibraryAudio();
  const contentLocked = isGuest || !isSubscriber;
  const lockHref = isGuest ? "/register" : "/subscribe";
  const lockHint = isGuest ? "Sign up to unlock" : "Subscribe to unlock";

  const handlePlayCollectionAudio = useCallback(
    (card: AudioCollectionCardDTO) => {
      if (contentLocked) {
        router.push(lockHref);
        return;
      }
      const src = card.audioUrl?.trim();
      if (!src) return;
      setCollectionActiveId(card.id);
      const subtitle =
        AUDIO_COLLECTION_CATEGORY_LABELS[card.category] ?? card.metaLine ?? "Audio";
      setTrack({
        // Reuse `prayerId` for the collection card id so the existing mini-player + favorites
        // wiring works without duplicating types. Card ids are uuid-prefixed and won't collide.
        prayerId: card.id,
        src,
        title: card.title,
        subtitle,
        duration: 0,
        coverSrc: card.imageUrl,
        coverUnoptimized: unoptimizedRemoteImage(card.imageUrl),
        locked: false,
      });
    },
    [contentLocked, lockHref, router, setTrack],
  );

  return (
    <PrayerLibraryLayoutPadding>
      <PrayerAudioLibraryShell
        collectionCards={layout.collections}
        contentLocked={contentLocked}
        lockHref={lockHref}
        lockHint={lockHint}
        onPlayCollectionAudio={handlePlayCollectionAudio}
        activeCollectionAudioId={collectionActiveId}
      />
      <PrayerMiniPlayerBar />
    </PrayerLibraryLayoutPadding>
  );
}

export default function PrayerAudioLibrary(props: PrayerAudioLibraryProps) {
  return (
    <PrayerLibraryAudioProvider>
      <PrayerAudioLibraryInner {...props} />
    </PrayerLibraryAudioProvider>
  );
}
