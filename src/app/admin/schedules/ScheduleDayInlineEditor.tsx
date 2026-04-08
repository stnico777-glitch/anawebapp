"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import { DAY_NAMES } from "@/constants/schedule";

export type ScheduleDayEditPayload = {
  scheduleId: string;
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
};

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function ScheduleDayInlineEditor({
  day,
  onCancel,
}: {
  day: ScheduleDayEditPayload;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dayImageUrl: "",
    dayVideoUrl: "",
    daySubtext: "",
    prayerTitle: "",
    workoutTitle: "",
    affirmationText: "",
  });

  useEffect(() => {
    setForm({
      dayImageUrl: day.dayImageUrl ?? "",
      dayVideoUrl: day.dayVideoUrl ?? "",
      daySubtext: day.daySubtext ?? "",
      prayerTitle: day.prayerTitle ?? "",
      workoutTitle: day.workoutTitle ?? "",
      affirmationText: day.affirmationText ?? "",
    });
  }, [day]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmAdminSave("Save changes to this day card?")) return;
    setSaving(true);
    try {
      const res = await adminJson(
        `/api/admin/schedules/${day.scheduleId}/days/${day.dayIndex}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            dayImageUrl: form.dayImageUrl,
            dayVideoUrl: form.dayVideoUrl,
            daySubtext: form.daySubtext,
            prayerTitle: form.prayerTitle.trim(),
            prayerId: null,
            workoutTitle: form.workoutTitle.trim(),
            workoutId: null,
            affirmationText: form.affirmationText,
          }),
        },
      );
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      router.refresh();
      onCancel();
    } finally {
      setSaving(false);
    }
  }

  const dayLabel = DAY_NAMES[day.dayIndex] ?? `Day ${day.dayIndex}`;
  const imagePreview =
    form.dayImageUrl.trim() &&
    (form.dayImageUrl.startsWith("http") || form.dayImageUrl.startsWith("/"))
      ? form.dayImageUrl.trim()
      : null;

  return (
    <article className="overflow-hidden rounded-lg border-2 border-sky-blue bg-app-surface shadow-[0_1px_2px_rgba(120,130,135,0.06)] [font-family:var(--font-body),sans-serif]">
      <div className="border-b border-sand bg-sunset-peach/30 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray">Editing</p>
        <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
          {dayLabel}
        </h2>
        <p className="mt-0.5 text-xs text-gray">
          Paste hosted image and video URLs. Day video overrides the linked movement video when both are set.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label className={labelClass}>Card image URL</label>
          <p className="mt-0.5 text-xs text-gray">Schedule card art and video poster (HTTPS or site path).</p>
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin URLs
            <img
              src={imagePreview}
              alt=""
              className="mt-2 max-h-28 w-full max-w-xs rounded object-contain"
            />
          ) : null}
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            className={inputClass}
            value={form.dayImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, dayImageUrl: e.target.value }))}
            placeholder="https://…"
          />
        </div>

        <div>
          <label className={labelClass}>Day workout video URL</label>
          <p className="mt-0.5 text-xs text-gray">
            Direct MP4/WebM. If empty, the linked library movement&apos;s video is used.
          </p>
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            className={inputClass}
            value={form.dayVideoUrl}
            onChange={(e) => setForm((f) => ({ ...f, dayVideoUrl: e.target.value }))}
            placeholder="https://… (optional)"
          />
        </div>

        <div>
          <label className={labelClass}>Subtext (under day name)</label>
          <input
            type="text"
            className={inputClass}
            value={form.daySubtext}
            onChange={(e) => setForm((f) => ({ ...f, daySubtext: e.target.value }))}
            placeholder="Short line on card"
          />
        </div>
        <div>
          <label className={labelClass}>Prayer</label>
          <p className="mt-0.5 text-xs text-gray">Label shown on the schedule card (not linked to the audio library).</p>
          <input
            type="text"
            className={inputClass}
            value={form.prayerTitle}
            onChange={(e) => setForm((f) => ({ ...f, prayerTitle: e.target.value }))}
            placeholder="Prayer title"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass}>Movement</label>
          <p className="mt-0.5 text-xs text-gray">Label shown on the schedule card (not linked to the movement library).</p>
          <input
            type="text"
            className={inputClass}
            value={form.workoutTitle}
            onChange={(e) => setForm((f) => ({ ...f, workoutTitle: e.target.value }))}
            placeholder="Movement title"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass}>Affirmation</label>
          <input
            type="text"
            className={inputClass}
            value={form.affirmationText}
            onChange={(e) => setForm((f) => ({ ...f, affirmationText: e.target.value }))}
            placeholder="Affirmation shown on card"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
          >
            Cancel
          </button>
        </div>
      </form>
    </article>
  );
}
