"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 450;

/**
 * Subscribes to Supabase Realtime for the active week so CMS edits appear without a full reload.
 * iOS: use the same `postgres_changes` filters — schema `public`, tables `schedule_day`
 * (`week_schedule_id=eq.<uuid>`) and `week_schedule` (`id=eq.<uuid>`).
 *
 * Debounces `router.refresh` so bursts of realtime events do not queue many full RSC refetches (lag).
 */
export default function ScheduleWeekRealtime({
  weekScheduleId,
}: {
  weekScheduleId: string;
}) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) return;

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        router.refresh();
      }, REFRESH_DEBOUNCE_MS);
    };

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
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "week_schedule",
          filter: `id=eq.${weekScheduleId}`,
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [weekScheduleId, router]);

  return null;
}
