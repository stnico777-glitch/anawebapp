"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_NAMES } from "@/constants/schedule";
import { formatWeekRange } from "@/lib/dateFormat";

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
  }[];
}

interface Workout {
  id: string;
  title: string;
}

interface Prayer {
  id: string;
  title: string;
}

export default function SchedulesClient({
  schedules,
  workouts,
  prayers,
}: {
  schedules: Schedule[];
  workouts: Workout[];
  prayers: Prayer[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function createSchedule() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function duplicateSchedule(id: string) {
    setDuplicating(id);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duplicateFromId: id }),
      });
      if (res.ok) router.refresh();
    } finally {
      setDuplicating(null);
    }
  }

  async function updateDay(
    scheduleId: string,
    dayIndex: number,
    data: Partial<{
      prayerTitle: string;
      prayerId: string;
      workoutTitle: string;
      workoutId: string;
      affirmationText: string;
    }>
  ) {
    const res = await fetch(
      `/api/admin/schedules/${scheduleId}/days/${dayIndex}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (res.ok) router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-3">
        <button
          onClick={createSchedule}
          disabled={creating}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create New Week"}
        </button>
      </div>

      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
            <h2 className="font-semibold">{formatWeekRange(new Date(schedule.weekStart), { includeYear: true })}</h2>
            <button
              onClick={() => duplicateSchedule(schedule.id)}
              disabled={duplicating === schedule.id}
              className="text-sm text-amber-600 hover:underline disabled:opacity-50"
            >
              {duplicating === schedule.id ? "Duplicating..." : "Duplicate"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700">
                  <th className="px-4 py-2 text-left">Day</th>
                  <th className="px-4 py-2 text-left">Prayer</th>
                  <th className="px-4 py-2 text-left">Movement</th>
                  <th className="px-4 py-2 text-left">Affirmation</th>
                </tr>
              </thead>
              <tbody>
                {schedule.days.map((day) => (
                  <tr
                    key={day.id}
                    className="border-b border-stone-100 dark:border-stone-800"
                  >
                    <td className="px-4 py-2 font-medium">
                      {DAY_NAMES[day.dayIndex]}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={day.prayerId ?? ""}
                        onChange={(e) =>
                          updateDay(schedule.id, day.dayIndex, {
                            prayerId: e.target.value || "",
                            prayerTitle:
                              prayers.find((p) => p.id === e.target.value)
                                ?.title ?? "",
                          })
                        }
                        className="rounded border border-stone-300 px-2 py-1 dark:bg-stone-800 dark:border-stone-600"
                      >
                        <option value="">—</option>
                        {prayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={day.workoutId ?? ""}
                        onChange={(e) =>
                          updateDay(schedule.id, day.dayIndex, {
                            workoutId: e.target.value || "",
                            workoutTitle:
                              workouts.find((w) => w.id === e.target.value)
                                ?.title ?? "",
                          })
                        }
                        className="rounded border border-stone-300 px-2 py-1 dark:bg-stone-800 dark:border-stone-600"
                      >
                        <option value="">—</option>
                        {workouts.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={day.affirmationText ?? ""}
                        onChange={(e) =>
                          updateDay(schedule.id, day.dayIndex, {
                            affirmationText: e.target.value,
                          })
                        }
                        placeholder="Affirmation..."
                        className="w-full max-w-xs rounded border border-stone-300 px-2 py-1 dark:bg-stone-800 dark:border-stone-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {schedules.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-400">
          No schedules yet. Click &quot;Create New Week&quot; to add one.
        </p>
      )}
    </div>
  );
}
