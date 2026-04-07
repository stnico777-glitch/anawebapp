"use client";

import { useCallback, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

export default function ScheduleDayVideoPlayer({
  scheduleDayId,
  src,
  poster,
  title,
  initialWorkoutDone,
}: {
  scheduleDayId: string;
  src: string;
  poster?: string;
  title: string;
  initialWorkoutDone: boolean;
}) {
  const [workoutDone, setWorkoutDone] = useState(initialWorkoutDone);

  const onComplete = useCallback(async () => {
    if (workoutDone) return;
    try {
      await fetch(`/api/schedule/${scheduleDayId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ workoutDone: true }),
      });
      setWorkoutDone(true);
    } catch {
      /* keep local state; user can mark complete from schedule card */
    }
  }, [scheduleDayId, workoutDone]);

  return (
    <VideoPlayer src={src} poster={poster} title={title} onComplete={onComplete} />
  );
}
