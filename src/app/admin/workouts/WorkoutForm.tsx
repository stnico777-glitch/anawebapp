"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

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

const UPLOAD_URL = "/api/admin/workouts/upload";

function pathnameForFile(file: File, kind: "thumbnail" | "video"): string {
  const dir = kind === "thumbnail" ? "workouts/thumbnails" : "workouts/videos";
  const dot = file.name.lastIndexOf(".");
  const ext =
    dot >= 0
      ? file.name.slice(dot).replace(/[^a-zA-Z0-9.]/g, "")
      : kind === "thumbnail"
        ? ".jpg"
        : ".mp4";
  return `${dir}/${Date.now()}${ext || (kind === "thumbnail" ? ".jpg" : ".mp4")}`;
}

function extractUrlFromDrop(e: React.DragEvent): string | null {
  const uri = e.dataTransfer.getData("text/uri-list").split("\n")[0]?.trim();
  if (uri && /^https?:\/\//i.test(uri)) return uri;
  const plain = e.dataTransfer.getData("text/plain").trim();
  const m = plain.match(/https?:\/\/[^\s]+/);
  return m?.[0] ?? null;
}

function MediaDropZone({
  label,
  hint,
  disabled,
  uploading,
  dragging,
  onDragState,
  onFiles,
  onUrlDrop,
  previewUrl,
}: {
  label: string;
  hint: string;
  disabled: boolean;
  uploading: boolean;
  dragging: boolean;
  onDragState: (v: boolean) => void;
  onFiles: (files: FileList | File[]) => void;
  onUrlDrop?: (url: string) => void;
  previewUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragState(true);
    },
    [onDragState],
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragState(false);
    },
    [onDragState],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragState(false);
      if (disabled || uploading) return;
      const files = e.dataTransfer.files;
      if (files?.length) {
        onFiles(files);
        return;
      }
      const url = extractUrlFromDrop(e);
      if (url && onUrlDrop) onUrlDrop(url);
    },
    [disabled, uploading, onFiles, onUrlDrop, onDragState],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-6 text-center transition [font-family:var(--font-body),sans-serif] ${
        dragging ? "border-sky-blue bg-sky-blue/5" : "border-sand bg-white/80"
      } ${disabled || uploading ? "pointer-events-none opacity-50" : "hover:border-sky-blue/60 hover:bg-sunset-peach/20"}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(ev) => {
          const list = ev.target.files;
          if (list?.length) onFiles(list);
          ev.target.value = "";
        }}
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="max-h-24 max-w-full rounded object-contain"
        />
      ) : null}
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-gray">{hint}</span>
      {uploading ? <span className="text-xs font-medium text-sky-blue">Uploading…</span> : null}
    </div>
  );
}

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
  const [blobConfigured, setBlobConfigured] = useState<boolean | null>(null);
  const [uploadThumb, setUploadThumb] = useState(false);
  const [uploadVideo, setUploadVideo] = useState(false);
  const [dragThumb, setDragThumb] = useState(false);
  const [dragVideo, setDragVideo] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(UPLOAD_URL, { credentials: "same-origin" });
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

  const uploadToBlob = useCallback(async (file: File, kind: "thumbnail" | "video") => {
    const pathname = pathnameForFile(file, kind);
    const result = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: UPLOAD_URL,
      clientPayload: kind,
      multipart: kind === "video",
    });
    return result.url;
  }, []);

  async function handleThumbnailFiles(files: FileList | File[]) {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Drop an image file (JPEG, PNG, WebP, or GIF).");
      return;
    }
    setUploadThumb(true);
    try {
      const url = await uploadToBlob(file, "thumbnail");
      setForm((f) => ({ ...f, thumbnailUrl: url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Thumbnail upload failed.");
    } finally {
      setUploadThumb(false);
    }
  }

  async function handleVideoFiles(files: FileList | File[]) {
    const file = files[0];
    if (!file) return;
    const ok =
      file.type.startsWith("video/") ||
      /\.(mp4|webm|mov)$/i.test(file.name);
    if (!ok) {
      alert("Drop a video file (MP4, WebM, or MOV).");
      return;
    }
    setUploadVideo(true);
    try {
      const url = await uploadToBlob(file, "video");
      setForm((f) => ({ ...f, videoUrl: url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Video upload failed.");
    } finally {
      setUploadVideo(false);
    }
  }

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
        credentials: "same-origin",
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
      credentials: "same-origin",
    });
    if (res.ok) router.refresh();
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
                <label className={labelClass}>Video *</label>
                <p className="mt-0.5 text-xs leading-relaxed text-gray">
                  The in-app player uses a direct video file (MP4 or WebM). Upload below or paste an
                  HTTPS link to the same file so it works on the website and on phones (hosted MP4,
                  Mux, Cloudflare Stream direct URL, etc.). YouTube page links won&apos;t play in the
                  built-in player—use a file URL or a stream that returns video.
                </p>
                <MediaDropZone
                  label="Drop video file or video link"
                  hint="MP4, WebM, MOV · or drag a link from your browser"
                  disabled={blobConfigured === false}
                  uploading={uploadVideo}
                  dragging={dragVideo}
                  onDragState={setDragVideo}
                  onFiles={handleVideoFiles}
                  onUrlDrop={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
                />
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  required
                  type="url"
                  placeholder="https://…"
                  className={`${inputClass} mt-2`}
                />
                {blobConfigured === false ? (
                  <p className="mt-1 text-xs text-amber-800">
                    Uploads disabled: add <code className="rounded bg-sand px-1">BLOB_READ_WRITE_TOKEN</code>{" "}
                    for Vercel Blob, or paste a video URL only.
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelClass}>Thumbnail</label>
                <p className="mt-0.5 text-xs text-gray">
                  Shown on cards and as the video poster. Drop an image or paste a URL.
                </p>
                <MediaDropZone
                  label="Drop thumbnail image or image link"
                  hint="JPEG, PNG, WebP, GIF · max 4MB"
                  disabled={blobConfigured === false}
                  uploading={uploadThumb}
                  dragging={dragThumb}
                  onDragState={setDragThumb}
                  onFiles={handleThumbnailFiles}
                  onUrlDrop={(url) => setForm((f) => ({ ...f, thumbnailUrl: url }))}
                  previewUrl={thumbPreview}
                />
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  type="url"
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
