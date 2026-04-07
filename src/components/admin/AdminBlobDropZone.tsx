"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export const ADMIN_BLOB_UPLOAD_URL = "/api/admin/workouts/upload";

function extractUrlFromDrop(e: React.DragEvent): string | null {
  const uri = e.dataTransfer.getData("text/uri-list").split("\n")[0]?.trim();
  if (uri && /^https?:\/\//i.test(uri)) return uri;
  const plain = e.dataTransfer.getData("text/plain").trim();
  const m = plain.match(/https?:\/\/[^\s]+/);
  return m?.[0] ?? null;
}

export function AdminBlobDropZone({
  clientPayload,
  buildPathname,
  acceptFile,
  fileKind,
  label,
  hint,
  disabled,
  onUploaded,
  onUrlDropped,
  previewUrl,
  previewAlt = "",
}: {
  clientPayload: string;
  buildPathname: (file: File) => string;
  acceptFile: (file: File) => boolean;
  fileKind: "image" | "video";
  label: string;
  hint: string;
  disabled: boolean;
  onUploaded: (url: string) => void;
  onUrlDropped?: (url: string) => void;
  previewUrl?: string | null;
  previewAlt?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const runUpload = useCallback(
    async (file: File) => {
      const pathname = buildPathname(file);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: ADMIN_BLOB_UPLOAD_URL,
        clientPayload,
        multipart: fileKind === "video",
      });
      onUploaded(result.url);
    },
    [buildPathname, clientPayload, fileKind, onUploaded],
  );

  const onFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0];
      if (!file) return;
      if (!acceptFile(file)) {
        alert(
          fileKind === "image"
            ? "Drop an image (JPEG, PNG, WebP, or GIF)."
            : "Drop a video (MP4, WebM, or MOV).",
        );
        return;
      }
      setUploading(true);
      try {
        await runUpload(file);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [acceptFile, fileKind, runUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      if (disabled || uploading) return;
      const fl = e.dataTransfer.files;
      if (fl?.length) {
        void onFiles(fl);
        return;
      }
      const url = extractUrlFromDrop(e);
      if (url && onUrlDropped) onUrlDropped(url);
    },
    [disabled, uploading, onFiles, onUrlDropped],
  );

  const acceptAttr = fileKind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";

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
      className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-5 text-center transition [font-family:var(--font-body),sans-serif] ${
        dragging ? "border-sky-blue bg-sky-blue/5" : "border-sand bg-white/80"
      } ${disabled || uploading ? "pointer-events-none opacity-50" : "hover:border-sky-blue/60 hover:bg-sunset-peach/20"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(ev) => {
          const list = ev.target.files;
          if (list?.length) void onFiles(list);
          ev.target.value = "";
        }}
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin URLs / blob
        <img src={previewUrl} alt={previewAlt} className="max-h-24 max-w-full rounded object-contain" />
      ) : null}
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-gray">{hint}</span>
      {uploading ? <span className="text-xs font-medium text-sky-blue">Uploading…</span> : null}
    </div>
  );
}

export function buildScheduleDayImagePath(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const ext =
    dot >= 0
      ? file.name.slice(dot).replace(/[^a-zA-Z0-9.]/g, "")
      : ".jpg";
  return `schedule-days/images/${Date.now()}${ext || ".jpg"}`;
}

export function buildScheduleDayVideoPath(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const ext =
    dot >= 0
      ? file.name.slice(dot).replace(/[^a-zA-Z0-9.]/g, "")
      : ".mp4";
  return `schedule-days/videos/${Date.now()}${ext || ".mp4"}`;
}
