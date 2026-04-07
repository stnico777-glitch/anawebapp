"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime for the active week so CMS edits appear without a full reload.
 * iOS: use the same `postgres_changes` filters — schema `public`, tables `schedule_day`
 * (`week_schedule_id=eq.<uuid>`) and `week_schedule` (`id=eq.<uuid>`).
 */
export default function ScheduleWeekRealtime({
  weekScheduleId,
}: {
  weekScheduleId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`schedule_week_${weekScheduleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_day",
          filter: `week_schedule_id=eq.${weekScheduleId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "week_schedule",
          filter: `id=eq.${weekScheduleId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [weekScheduleId, router]);

  return null;
}
