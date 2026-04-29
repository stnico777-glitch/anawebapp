"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

/**
 * Parity with the awake-align mobile app: completing the schedule-day Start flow
 * (encouragement → movement → finish) marks the day fully done — all three bullets,
 * not just the workout. See `ScheduleStartScreen#runCompletionSync` in the mobile
 * codebase, which patches `prayerDone | workoutDone | affirmationDone = true`.
 */
const DAY_DONE_BODY = {
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

  const patchDayDone = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/schedule/${scheduleDayId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(DAY_DONE_BODY),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [scheduleDayId]);

  const markDayComplete = useCallback(async () => {
    if (hasSyncedCompletionRef.current) return;
    const ok = await patchDayDone();
    if (ok) hasSyncedCompletionRef.current = true;
  }, [patchDayDone]);

  const onComplete = markDayComplete;

  const onFinish = useCallback(async () => {
    if (finishBusy) return;
    setFinishBusy(true);
    try {
      if (!hasSyncedCompletionRef.current) {
        const ok = await patchDayDone();
        if (ok) hasSyncedCompletionRef.current = true;
      }
      router.refresh();
      router.push("/journaling");
    } finally {
      setFinishBusy(false);
    }
  }, [finishBusy, patchDayDone, router]);

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
