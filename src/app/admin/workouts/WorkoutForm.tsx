"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function WorkoutForm({ workout }: { workout?: Workout }) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = workout
        ? `/api/admin/workouts/${workout.id}`
        : "/api/admin/workouts";
      const method = workout ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          instructor: form.instructor || undefined,
          category: form.category || undefined,
          scripture: form.scripture || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!workout || !confirm("Delete this movement session?")) return;
    const res = await fetch(`/api/admin/workouts/${workout.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        {workout ? "Edit" : "Add movement"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 dark:bg-stone-900"
          >
            <h2 className="text-lg font-semibold">
              {workout ? "Edit movement" : "Add movement"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Instructor</label>
                <input
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Duration (min) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value, 10) || 0 })
                  }
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Strength, Cardio, Yoga..."
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Scripture</label>
                <input
                  value={form.scripture}
                  onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Video URL *</label>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  required
                  type="url"
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Thumbnail URL</label>
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) =>
                    setForm({ ...form, thumbnailUrl: e.target.value })
                  }
                  type="url"
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              {workout && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
