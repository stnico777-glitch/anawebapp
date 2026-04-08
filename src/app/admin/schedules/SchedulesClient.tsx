"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarWeekIcon from "@/components/CalendarWeekIcon";
import ScheduleDayCard from "@/components/ScheduleDayCard";
import ScheduleSabbathTile from "@/components/ScheduleSabbathTile";
import { formatWeekRange } from "@/lib/dateFormat";
import {
  getMondayUTC,
  parseScheduleDateInput,
  utcMidnightForUtcDate,
  weekScheduleAnchorKeyUTC,
} from "@/lib/weekScheduleCalendar";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import ScheduleDayInlineEditor, {
  type ScheduleDayEditPayload,
} from "./ScheduleDayInlineEditor";

interface Schedule {
  id: string;
  weekStart: string;
  days: {
    id: string;
    dayIndex: number;
    prayerTitle: string | null;
    prayerId: string | null;
    workoutTitle: string | null;
    workoutId: string | null;
    affirmationText: string | null;
    dayImageUrl: string | null;
    dayVideoUrl: string | null;
    daySubtext: string | null;
  }[];
}

export default function SchedulesClient({
  schedules,
}: {
  schedules: Schedule[];
}) {
  const router = useRouter();
  const sorted = useMemo(
    () =>
      [...schedules].sort(
        (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime(),
      ),
    [schedules],
  );

  const [selectedId, setSelectedId] = useState<string>(() => sorted[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [deletingWeekId, setDeletingWeekId] = useState<string | null>(null);
  const [editDay, setEditDay] = useState<ScheduleDayEditPayload | null>(null);
  const [selectWeekDate, setSelectWeekDate] = useState(() =>
    sorted[0] ? sorted[0].weekStart.slice(0, 10) : "",
  );

  useEffect(() => {
    if (sorted.length === 0) {
      setSelectedId("");
      return;
    }
    if (!sorted.some((s) => s.id === selectedId)) {
      setSelectedId(sorted[0]!.id);
    }
  }, [sorted, selectedId]);

  const selected = sorted.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) {
      setSelectWeekDate(selected.weekStart.slice(0, 10));
    }
  }, [selected?.id, selected?.weekStart]);

  async function createSchedule(weekStart?: string) {
    setCreating(true);
    try {
      const res = await adminJson("/api/admin/schedules", {
        method: "POST",
        body: JSON.stringify(weekStart ? { weekStart } : {}),
      });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      const data = (await res.json().catch(() => null)) as { id?: string } | null;
      if (data?.id) setSelectedId(data.id);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function applySelectWeek() {
    if (!selectWeekDate.trim()) return;
    const parsed = parseScheduleDateInput(selectWeekDate);
    if (Number.isNaN(parsed.getTime())) return;
    const key = weekScheduleAnchorKeyUTC(parsed);
    const matches = sorted.filter(
      (s) => weekScheduleAnchorKeyUTC(new Date(s.weekStart)) === key,
    );
    if (matches.length > 0) {
      setSelectedId(matches[0]!.id);
      if (matches.length > 1) {
        alert(
          `This week has ${matches.length} schedules in the database. One is selected—delete extras or run \`npx prisma db seed\` to dedupe.`,
        );
      }
      return;
    }
    const mondayUtc = utcMidnightForUtcDate(getMondayUTC(parsed));
    if (
      !confirm(
        `No schedule for ${formatWeekRange(mondayUtc, { includeYear: true })}. Create a blank week?`,
      )
    ) {
      return;
    }
    await createSchedule(selectWeekDate);
  }

  async function deleteSchedule(scheduleId: string) {
    const s = sorted.find((x) => x.id === scheduleId);
    const label = s
      ? formatWeekRange(new Date(s.weekStart), { includeYear: true })
      : "this week";
    if (
      !confirm(
        `Delete the schedule for ${label}? This removes all 7 days and any member completion records tied to those days. This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingWeekId(scheduleId);
    try {
      const res = await adminJson(`/api/admin/schedules/${scheduleId}`, { method: "DELETE" });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      setEditDay(null);
      if (selectedId === scheduleId) {
        const remaining = sorted.filter((x) => x.id !== scheduleId);
        setSelectedId(remaining[0]?.id ?? "");
        setSelectWeekDate(remaining[0] ? remaining[0].weekStart.slice(0, 10) : "");
      }
      router.refresh();
    } finally {
      setDeletingWeekId(null);
    }
  }

  const toolbarBtnClass =
    "rounded-md border border-sand bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-sunset-peach/40 [font-family:var(--font-body),sans-serif]";

  return (
    <div className="mt-2 space-y-8 pb-12 md:space-y-10 md:pb-16">
      {sorted.length > 0 ? (
        <div className="rounded-lg border border-sand bg-white/90 p-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)]">
          <p className="mb-3 text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
            All weeks in database ({sorted.length})
          </p>
          <p className="mb-3 text-xs text-gray [font-family:var(--font-body),sans-serif]">
            Tap a week to open it in the grid below. Newest first. Use delete to remove a week from the
            database (including day rows and completion data).
          </p>
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto sm:max-h-none sm:flex-row sm:flex-wrap">
            {sorted.map((s) => {
              const active = s.id === selectedId;
              const busy = deletingWeekId === s.id;
              return (
                <li key={s.id} className="flex max-w-full items-stretch gap-1 sm:max-w-none">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setSelectWeekDate(s.weekStart.slice(0, 10));
                    }}
                    className={`min-w-0 flex-1 rounded-md border px-3 py-2 text-left text-sm transition sm:flex-initial [font-family:var(--font-body),sans-serif] ${
                      active
                        ? "border-sky-blue bg-sky-blue/10 font-semibold text-foreground"
                        : "border-sand bg-white text-gray hover:bg-sunset-peach/30 hover:text-foreground"
                    }`}
                  >
                    {formatWeekRange(new Date(s.weekStart), { includeYear: true })}
                  </button>
                  <button
                    type="button"
                    title="Delete this week from the database"
                    disabled={busy || deletingWeekId !== null}
                    onClick={() => void deleteSchedule(s.id)}
                    className="shrink-0 rounded-md border border-sand bg-white px-2.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-body),sans-serif]"
                  >
                    {busy ? "…" : "Delete"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-lg border border-sand bg-white/90 p-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)] md:flex-row md:flex-wrap md:items-start md:gap-3">
        <label className="flex min-w-[min(100%,18rem)] flex-1 flex-col gap-1 text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]">
          Select week
          <span className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={selectWeekDate}
              onChange={(e) => setSelectWeekDate(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]"
            />
            <button
              type="button"
              onClick={() => void applySelectWeek()}
              disabled={!selectWeekDate || creating}
              className={toolbarBtnClass}
            >
              Go
            </button>
          </span>
          <span className="text-xs font-normal text-gray/90">
            Any date in the week works; we snap to the same Monday the app stores for that week.
          </span>
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sand bg-app-surface/80 p-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
          No schedules yet. Choose a week above and tap <strong className="font-semibold text-foreground">Go</strong>{" "}
          to create the first one.
        </p>
      ) : selected ? (
        <div className="space-y-8 md:space-y-10">
          <div>
            <div className="mb-2 flex flex-row items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <CalendarWeekIcon className="h-[15px] w-[15px] shrink-0 text-gray" />
                <p className="min-w-0 truncate text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                  {formatWeekRange(new Date(selected.weekStart))}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.04em] text-sky-blue [font-family:var(--font-body),sans-serif]">
                0/7 complete
              </p>
            </div>
            <div className="h-px bg-[rgba(232,228,212,0.9)]" aria-hidden />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {selected.days.map((day) => {
              const payload: ScheduleDayEditPayload = {
                scheduleId: selected.id,
                id: day.id,
                dayIndex: day.dayIndex,
                prayerTitle: day.prayerTitle,
                prayerId: day.prayerId,
                workoutTitle: day.workoutTitle,
                workoutId: day.workoutId,
                affirmationText: day.affirmationText,
                dayImageUrl: day.dayImageUrl,
                dayVideoUrl: day.dayVideoUrl,
                daySubtext: day.daySubtext,
              };
              const isEditing = editDay?.id === day.id;
              if (isEditing && editDay) {
                return (
                  <ScheduleDayInlineEditor
                    key={day.id}
                    day={editDay}
                    onCancel={() => setEditDay(null)}
                  />
                );
              }
              return (
                <ScheduleDayCard
                  key={day.id}
                  day={{
                    id: day.id,
                    dayIndex: day.dayIndex,
                    prayerTitle: day.prayerTitle,
                    workoutTitle: day.workoutTitle,
                    affirmationText: day.affirmationText,
                    prayerId: day.prayerId,
                    workoutId: day.workoutId,
                    dayImageUrl: day.dayImageUrl,
                    dayVideoUrl: day.dayVideoUrl,
                    daySubtext: day.daySubtext,
                    completion: null,
                  }}
                  isToday={false}
                  isLocked={false}
                  cmsMode
                  onEditCard={() => setEditDay(payload)}
                />
              );
            })}
            <div className="col-span-2 flex justify-center sm:col-span-2 lg:col-span-1 lg:col-start-2">
              <div className="w-full sm:max-w-[calc((100%-1rem)/2)] lg:max-w-none">
                <ScheduleSabbathTile isToday={false} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
