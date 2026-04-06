"use client";

import { useCallback } from "react";
import VideoPlayer from "@/components/VideoPlayer";

interface WorkoutPlayerProps {
  workoutId: string;
  src: string;
  poster?: string;
  title: string;
  isCompleted: boolean;
}

export default function WorkoutPlayer({
  workoutId,
  src,
  poster,
  title,
  isCompleted,
}: WorkoutPlayerProps) {
  const handleComplete = useCallback(async () => {
    if (isCompleted) return;
    await fetch(`/api/workouts/${workoutId}/complete`, { method: "POST" });
  }, [workoutId, isCompleted]);

  return (
    <VideoPlayer
      src={src}
      poster={poster}
      title={title}
      onComplete={handleComplete}
    />
  );
}
