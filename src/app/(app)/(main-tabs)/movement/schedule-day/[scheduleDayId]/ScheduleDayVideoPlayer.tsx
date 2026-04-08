"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

const FULL_DAY_BODY = {
  prayerDone: true,
  workoutDone: true,
  affirmationDone: true,
} as const;

export default function ScheduleDayVideoPlayer({
  scheduleDayId,
  src,
  poster,
  title,
  fetchPriority,
}: {
  scheduleDayId: string;
  src: string;
  poster?: string;
  title: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const router = useRouter();
  const [finishBusy, setFinishBusy] = useState(false);
  /** After a successful PATCH this session, skip duplicate calls from video progress. */
  const hasSyncedCompletionRef = useRef(false);

  const patchFullDay = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/schedule/${scheduleDayId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(FULL_DAY_BODY),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [scheduleDayId]);

  const markDayFullyComplete = useCallback(async () => {
    if (hasSyncedCompletionRef.current) return;
    const ok = await patchFullDay();
    if (ok) hasSyncedCompletionRef.current = true;
  }, [patchFullDay]);

  const onComplete = markDayFullyComplete;

  const onFinish = useCallback(async () => {
    if (finishBusy) return;
    setFinishBusy(true);
    try {
      if (!hasSyncedCompletionRef.current) {
        const ok = await patchFullDay();
        if (ok) hasSyncedCompletionRef.current = true;
      }
      router.refresh();
      router.push("/schedule");
    } finally {
      setFinishBusy(false);
    }
  }, [finishBusy, patchFullDay, router]);

  return (
    <div className="w-full">
      <VideoPlayer
        src={src}
        poster={poster}
        title={title}
        onComplete={onComplete}
        fetchPriority={fetchPriority}
      />
      <div className="mt-6 flex justify-center sm:mt-7">
        <button
          type="button"
          onClick={onFinish}
          disabled={finishBusy}
          className="inline-flex min-w-[10rem] items-center justify-center rounded-xl bg-sky-blue px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(110,173,228,0.35)] transition-[opacity,box-shadow] hover:opacity-90 hover:shadow-[0_6px_24px_rgba(110,173,228,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface disabled:opacity-70 [font-family:var(--font-body),sans-serif]"
        >
          {finishBusy ? "Saving…" : "Finish"}
        </button>
      </div>
    </div>
  );
}
