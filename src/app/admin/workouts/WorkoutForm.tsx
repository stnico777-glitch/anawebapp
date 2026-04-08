"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";

interface Workout {
  id: string;
  title: string;
  instructor: string | null;
  duration: number;
  category: string | null;
  scripture: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
}

const inputClass =
  "mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function WorkoutForm({
  workout,
  triggerClassName,
  triggerLabel,
}: {
  workout?: Workout;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: workout?.title ?? "",
    instructor: workout?.instructor ?? "",
    duration: workout?.duration ?? 20,
    category: workout?.category ?? "",
    scripture: workout?.scripture ?? "",
    videoUrl: workout?.videoUrl ?? "",
    thumbnailUrl: workout?.thumbnailUrl ?? "",
  });

  /* eslint-disable react-hooks/exhaustive-deps -- primitive field deps avoid resetting when parent passes new `workout` object refs */
  useEffect(() => {
    if (!workout) return;
    setForm({
      title: workout.title,
      instructor: workout.instructor ?? "",
      duration: workout.duration,
      category: workout.category ?? "",
      scripture: workout.scripture ?? "",
      videoUrl: workout.videoUrl,
      thumbnailUrl: workout.thumbnailUrl ?? "",
    });
  }, [
    workout?.id,
    workout?.title,
    workout?.instructor,
    workout?.duration,
    workout?.category,
    workout?.scripture,
    workout?.videoUrl,
    workout?.thumbnailUrl,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        workout ? "Save changes to this movement?" : "Create this movement?",
      )
    )
      return;
    setSaving(true);
    try {
      const url = workout
        ? `/api/admin/workouts/${workout.id}`
        : "/api/admin/workouts";
      const method = workout ? "PATCH" : "POST";
      const res = await adminJson(url, {
        method,
        body: JSON.stringify({
          ...form,
          instructor: form.instructor || undefined,
          category: form.category || undefined,
          scripture: form.scripture || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
        }),
      });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!workout || !confirm("Delete this movement session?")) return;
    const res = await adminJson(`/api/admin/workouts/${workout.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const defaultTriggerClass = workout
    ? "shrink-0 rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
    : "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

  const thumbPreview =
    form.thumbnailUrl?.trim() &&
    (form.thumbnailUrl.startsWith("http") || form.thumbnailUrl.startsWith("/"))
      ? form.thumbnailUrl.trim()
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTriggerClass}
      >
        {triggerLabel ?? (workout ? "Edit" : "Add movement")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
          >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {workout ? "Edit movement" : "Add movement"}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Instructor</label>
                <input
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Duration (min) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value, 10) || 0 })
                  }
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Strength, Cardio, Yoga..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Scripture</label>
                <input
                  value={form.scripture}
                  onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Video URL *</label>
                <p className="mt-0.5 text-xs leading-relaxed text-gray">
                  Direct MP4 or WebM HTTPS link (hosted file, CDN, etc.). YouTube page links won&apos;t play in the
                  built-in player.
                </p>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  required
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Thumbnail URL</label>
                <p className="mt-0.5 text-xs text-gray">Library card and video poster; optional.</p>
                {thumbPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin URLs
                  <img
                    src={thumbPreview}
                    alt=""
                    className="mt-2 max-h-24 max-w-full rounded object-contain"
                  />
                ) : null}
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://… (optional)"
                  className={`${inputClass} mt-2`}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
              >
                Cancel
              </button>
              {workout && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
