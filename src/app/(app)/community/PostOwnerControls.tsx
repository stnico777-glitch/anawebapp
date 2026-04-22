"use client";

import { useState } from "react";
import type { CommunityFeedItem } from "@/lib/community-feed";

function apiPathForItem(item: CommunityFeedItem): string {
  return item.kind === "prayer"
    ? `/api/prayer-requests/${item.id}`
    : `/api/praise-reports/${item.id}`;
}

/**
 * Inline edit/delete controls shown only to the author of a post.
 *
 * `onUpdated` fires after a successful edit with the new content.
 * `onDeleted` fires after a successful delete.
 * Errors surface as inline messages next to the controls.
 */
export default function PostOwnerControls({
  item,
  onUpdated,
  onDeleted,
  className = "",
}: {
  item: CommunityFeedItem;
  onUpdated?: (nextContent: string) => void;
  onDeleted?: () => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item.ownedByViewer) return null;

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === item.content.trim()) {
      setEditing(false);
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiPathForItem(item), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          data?.error === "membership_required"
            ? "You need an active membership to edit posts."
            : "Could not save changes. Try again.",
        );
        return;
      }
      onUpdated?.(trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (
      !window.confirm(
        item.kind === "prayer"
          ? "Delete this prayer request? This can't be undone."
          : "Delete this praise report? This can't be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiPathForItem(item), { method: "DELETE" });
      if (!res.ok) {
        setError("Could not delete. Try again.");
        return;
      }
      onDeleted?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
            rows={3}
            disabled={busy}
            className="w-full resize-y rounded-lg border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={saveEdit}
              className="rounded-full bg-sky-blue px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(item.content);
                setEditing(false);
                setError(null);
              }}
              className="rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-medium text-gray hover:bg-app-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft(item.content);
              setEditing(true);
              setError(null);
            }}
            className="rounded-full border border-sand bg-white px-3 py-1 font-medium text-foreground transition hover:bg-app-surface disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={confirmDelete}
            className="rounded-full border border-sand bg-white px-3 py-1 font-medium text-accent-pink transition hover:bg-accent-pink/10 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-1 text-xs text-accent-pink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
