"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { DAY_NAMES } from "@/constants/schedule";
import {
  ADMIN_BLOB_UPLOAD_URL,
  AdminBlobDropZone,
  buildScheduleDayImagePath,
  buildScheduleDayVideoPath,
} from "@/components/admin/AdminBlobDropZone";

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

export default function ScheduleDayEditModal({
  open,
  onClose,
  day,
  workouts,
  prayers,
}: {
  open: boolean;
  onClose: () => void;
  day: ScheduleDayEditPayload | null;
  workouts: { id: string; title: string }[];
  prayers: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [blobConfigured, setBlobConfigured] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    dayImageUrl: "",
    dayVideoUrl: "",
    daySubtext: "",
    prayerId: "",
    workoutId: "",
    affirmationText: "",
  });

  useEffect(() => {
    if (!day) return;
    setForm({
      dayImageUrl: day.dayImageUrl ?? "",
      dayVideoUrl: day.dayVideoUrl ?? "",
      daySubtext: day.daySubtext ?? "",
      prayerId: day.prayerId ?? "",
      workoutId: day.workoutId ?? "",
      affirmationText: day.affirmationText ?? "",
    });
  }, [day]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(ADMIN_BLOB_UPLOAD_URL, { credentials: "same-origin" });
        if (cancelled) return;
        if (res.ok) {
          const j = (await res.json()) as { blobUploadsConfigured?: boolean };
          setBlobConfigured(j.blobUploadsConfigured === true);
        } else {
          setBlobConfigured(false);
        }
      } catch {
        if (!cancelled) setBlobConfigured(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open || !day) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = day;
    if (!d) return;
    setSaving(true);
    try {
      const prayerTitle =
        prayers.find((p) => p.id === form.prayerId)?.title ?? d.prayerTitle ?? "";
      const workoutTitle =
        workouts.find((w) => w.id === form.workoutId)?.title ?? d.workoutTitle ?? "";
      const res = await adminJson(
        `/api/admin/schedules/${d.scheduleId}/days/${d.dayIndex}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            dayImageUrl: form.dayImageUrl,
            dayVideoUrl: form.dayVideoUrl,
            daySubtext: form.daySubtext,
            prayerId: form.prayerId || null,
            prayerTitle: form.prayerId ? prayerTitle : "",
            workoutId: form.workoutId || null,
            workoutTitle: form.workoutId ? workoutTitle : "",
            affirmationText: form.affirmationText,
          }),
        },
      );
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const dayLabel = DAY_NAMES[day.dayIndex] ?? `Day ${day.dayIndex}`;
  const blobDisabled = blobConfigured === false;
  const imagePreview =
    form.dayImageUrl.trim() &&
    (form.dayImageUrl.startsWith("http") || form.dayImageUrl.startsWith("/"))
      ? form.dayImageUrl.trim()
      : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
      >
        <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
          Edit {dayLabel}
        </h2>
        <p className="mt-1 text-xs text-gray">
          Updates the member schedule card for this day. Day video overrides the library movement video when both are set.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Card image</label>
            <p className="mt-0.5 text-xs text-gray">
              Drag an image, a link, or paste a URL. Used on the schedule card and as the video poster.
            </p>
            <AdminBlobDropZone
              clientPayload="scheduleDayImage"
              buildPathname={buildScheduleDayImagePath}
              acceptFile={(f) => f.type.startsWith("image/")}
              fileKind="image"
              label="Drop image or image link"
              hint="JPEG, PNG, WebP, GIF · max 4MB"
              disabled={blobDisabled}
              onUploaded={(url) => setForm((f) => ({ ...f, dayImageUrl: url }))}
              onUrlDropped={(url) => setForm((f) => ({ ...f, dayImageUrl: url }))}
              previewUrl={imagePreview}
              previewAlt="Card preview"
            />
            <input
              type="text"
              inputMode="url"
              autoComplete="off"
              className={inputClass}
              value={form.dayImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, dayImageUrl: e.target.value }))}
              placeholder="https://… or /path/in/public"
            />
          </div>

          <div>
            <label className={labelClass}>Day workout video</label>
            <p className="mt-0.5 text-xs text-gray">
              Direct MP4/WebM (or upload). This is the video for this day on web and mobile. If empty, the linked
              library movement’s video is used.
            </p>
            <AdminBlobDropZone
              clientPayload="scheduleDayVideo"
              buildPathname={buildScheduleDayVideoPath}
              acceptFile={(f) =>
                f.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(f.name)
              }
              fileKind="video"
              label="Drop video file or link"
              hint="MP4, WebM, MOV"
              disabled={blobDisabled}
              onUploaded={(url) => setForm((f) => ({ ...f, dayVideoUrl: url }))}
              onUrlDropped={(url) => setForm((f) => ({ ...f, dayVideoUrl: url }))}
            />
            <input
              type="text"
              inputMode="url"
              autoComplete="off"
              className={inputClass}
              value={form.dayVideoUrl}
              onChange={(e) => setForm((f) => ({ ...f, dayVideoUrl: e.target.value }))}
              placeholder="https://… (optional if library movement has video)"
            />
          </div>

          {blobDisabled ? (
            <p className="text-xs text-amber-800">
              File upload needs <code className="rounded bg-sand px-1">BLOB_READ_WRITE_TOKEN</code>. You can still paste
              URLs.
            </p>
          ) : null}

          <div>
            <label className={labelClass}>Subtext (under day name on card)</label>
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
            <select
              className={inputClass}
              value={form.prayerId}
              onChange={(e) => setForm((f) => ({ ...f, prayerId: e.target.value }))}
            >
              <option value="">—</option>
              {prayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Movement</label>
            <select
              className={inputClass}
              value={form.workoutId}
              onChange={(e) => setForm((f) => ({ ...f, workoutId: e.target.value }))}
            >
              <option value="">—</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
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
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
