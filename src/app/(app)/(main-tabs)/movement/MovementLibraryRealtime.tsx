"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 450;

const MOVEMENT_LANDING_COPY_ID = "main";

/**
 * Subscribes to Supabase Realtime for movement library CMS tables so edits appear without a full reload.
 * Debounces `router.refresh` so bursts of realtime events do not queue many full RSC refetches (lag).
 */
export default function MovementLibraryRealtime() {
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
      .channel("movement_library_cms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "movement_landing_copy",
          filter: `id=eq.${MOVEMENT_LANDING_COPY_ID}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "movement_hero_tile",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "movement_quickie_card",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout",
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
