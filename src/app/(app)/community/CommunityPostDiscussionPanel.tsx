"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommunityFeedItem } from "@/lib/community-feed";
import { IconComment } from "@/components/CommunityIcons";

const ACTION_ICON = "h-4 w-4 shrink-0 opacity-[0.92]";

const THREAD_INDENT =
  "pl-[calc(2.5rem+0.75rem)] sm:pl-[calc(0.25rem+2.75rem+1rem)]";

type ThreadComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function formatFeedTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function feedAvatarLetter(authorName: string, content: string) {
  const n = authorName.trim();
  if (n.length > 0 && n.toLowerCase() !== "anonymous")
    return n[0]!.toUpperCase();
  const c = content.trim();
  if (c.length > 0) return c[0]!.toUpperCase();
  return "?";
}

function actionBtnClass(active: boolean, busy?: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:text-sm";
  if (busy) return `${base} cursor-wait border-transparent bg-transparent text-gray/60`;
  if (active)
    return `${base} border-sky-blue/40 bg-sky-blue/10 text-foreground`;
  return `${base} border-transparent bg-transparent text-foreground hover:bg-app-surface`;
}

export function commentsApiPath(item: CommunityFeedItem): string {
  return item.kind === "prayer"
    ? `/api/prayer-requests/${item.id}/comments`
    : `/api/praise-reports/${item.id}/comments`;
}

type CommunityPostDiscussionPanelProps = {
  item: CommunityFeedItem;
  defaultCommentName?: string;
  /** Called after a comment is successfully posted (new total count). */
  onCommentCountUpdate?: (nextCount: number) => void;
  className?: string;
  /** `flush` = full width (inline feed). `thread` = indented to match avatar column in modal. */
  align?: "thread" | "flush";
};

/**
 * Discussion thread + composer — used in the detail modal and inline in the feed.
 */
export default function CommunityPostDiscussionPanel({
  item,
  defaultCommentName,
  onCommentCountUpdate,
  className = "",
  align = "thread",
}: CommunityPostDiscussionPanelProps) {
  const router = useRouter();
  const formId = useId();
  const nameInputId = `${formId}-comment-name`;
  const bodyInputId = `${formId}-comment-body`;
  const composerRegionId = `${formId}-composer`;

  const [comments, setComments] = useState<ThreadComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showCommentComposer, setShowCommentComposer] = useState(false);
  const commentBodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCommentBody("");
    setCommentsError(null);
    setCommentAuthor(defaultCommentName?.trim() ?? "");
    setShowCommentComposer(false);
  }, [item.id, item.kind, defaultCommentName]);

  useEffect(() => {
    if (!showCommentComposer) return;
    const id = window.requestAnimationFrame(() => {
      commentBodyRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [showCommentComposer]);

  useEffect(() => {
    let cancelled = false;
    setCommentsLoading(true);
    setCommentsError(null);
    const url = commentsApiPath(item);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("load");
        return r.json() as Promise<{ comments: ThreadComment[] }>;
      })
      .then((d) => {
        if (!cancelled) setComments(d.comments ?? []);
      })
      .catch(() => {
        if (!cancelled) setCommentsError("Could not load comments.");
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, item.kind]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const res = await fetch(commentsApiPath(item), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentBody.trim(),
          authorName: commentAuthor.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { comment: ThreadComment }
        | { error?: string };
      if (!res.ok || !data || !("comment" in data)) return;
      setComments((prev) => [...prev, data.comment]);
      setCommentBody("");
      setShowCommentComposer(false);
      const next = item.commentCount + 1;
      onCommentCountUpdate?.(next);
      router.refresh();
    } finally {
      setPostingComment(false);
    }
  }

  const indentClass = align === "flush" ? "" : THREAD_INDENT;

  return (
    <div className={`${indentClass} ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray">
          Discussion
          {comments.length > 0 ? (
            <span className="ml-1 font-semibold text-foreground/80">
              ({comments.length})
            </span>
          ) : null}
        </p>
        <button
          type="button"
          className={actionBtnClass(showCommentComposer)}
          aria-expanded={showCommentComposer}
          aria-controls={composerRegionId}
          onClick={() => setShowCommentComposer((v) => !v)}
        >
          <IconComment className={ACTION_ICON} />
          <span>{showCommentComposer ? "Cancel" : "Comment"}</span>
          <span className="tabular-nums text-gray">{item.commentCount}</span>
        </button>
      </div>

      {commentsLoading ? (
        <p className="mt-3 text-sm text-gray">Loading comments…</p>
      ) : commentsError ? (
        <p className="mt-3 text-sm text-accent-pink">{commentsError}</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-sm text-gray">No replies yet.</p>
      ) : (
        <ul className="mt-3 space-y-4" aria-label="Comment thread">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2.5 sm:gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-surface text-xs font-semibold text-foreground ring-1 ring-sand"
                aria-hidden
              >
                {feedAvatarLetter(c.authorName, c.body)}
              </div>
              <div className="min-w-0 flex-1">
                <header className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {c.authorName}
                  </span>
                  <span className="text-gray">·</span>
                  <time
                    dateTime={c.createdAt}
                    className="text-xs text-gray"
                  >
                    {formatFeedTime(c.createdAt)}
                  </time>
                </header>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showCommentComposer ? (
        <form
          id={composerRegionId}
          className="mt-4 space-y-2"
          onSubmit={submitComment}
        >
          <label className="sr-only" htmlFor={nameInputId}>
            Your name
          </label>
          <input
            id={nameInputId}
            type="text"
            maxLength={80}
            autoComplete="nickname"
            placeholder="Your name"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
          />
          <label className="sr-only" htmlFor={bodyInputId}>
            Comment
          </label>
          <textarea
            ref={commentBodyRef}
            id={bodyInputId}
            rows={3}
            maxLength={2000}
            placeholder="Write a reply…"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="w-full resize-y rounded-lg border border-sand bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
          />
          <button
            type="submit"
            disabled={postingComment || !commentBody.trim()}
            className="rounded-full bg-sky-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {postingComment ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
