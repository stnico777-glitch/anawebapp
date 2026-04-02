"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommunityFeedItem } from "@/lib/community-feed";
import {
  IconCelebrate,
  IconEncourage,
  IconPrayer,
} from "@/components/CommunityIcons";
import { EncourageForm } from "./PrayerPraiseFeed";
import CommunityPostDiscussionPanel from "./CommunityPostDiscussionPanel";

const ACTION_ICON = "h-4 w-4 shrink-0 opacity-[0.92]";

const THREAD_INDENT =
  "pl-[calc(2.5rem+0.75rem)] sm:pl-[calc(0.25rem+2.75rem+1rem)]";

type PrayerInteractResponse = {
  counts: { pray: number; like: number; encourage: number };
  viewer: {
    pray: boolean;
    like: boolean;
    encourage: { presetKey: string | null; message: string | null } | null;
  };
};

type CelebrateResponse = {
  count: number;
  viewerCelebrated: boolean;
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

export default function CommunityPostDetailModal({
  item,
  defaultCommentName,
  onClose,
}: {
  item: CommunityFeedItem | null;
  defaultCommentName?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [live, setLive] = useState<CommunityFeedItem | null>(item);
  const [openEncourage, setOpenEncourage] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLive(item);
    setOpenEncourage(false);
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  async function postPrayerInteraction(
    prayerId: string,
    body: Record<string, unknown>,
  ) {
    setBusy(true);
    try {
      const res = await fetch(`/api/prayer-requests/${prayerId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | PrayerInteractResponse
        | { error?: string };
      if (!res.ok || !data || "error" in data) return;
      const snap = data as PrayerInteractResponse;
      setLive((cur) =>
        cur?.kind === "prayer" && cur.id === prayerId
          ? { ...cur, counts: snap.counts, viewer: snap.viewer }
          : cur,
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleCelebrate(praiseId: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/praise-reports/${praiseId}/celebrate`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | CelebrateResponse
        | { error?: string };
      if (!res.ok || !data || "error" in data) return;
      const snap = data as CelebrateResponse;
      setLive((cur) =>
        cur?.kind === "praise" && cur.id === praiseId
          ? {
              ...cur,
              counts: { celebrate: snap.count },
              viewer: { celebrated: snap.viewerCelebrated },
            }
          : cur,
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!item || !live) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-post-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-sand bg-app-surface shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-sand bg-white px-4 py-3 sm:px-5">
          <h2
            id="community-post-detail-title"
            className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]"
          >
            {live.kind === "prayer" ? "Prayer request" : "Praise report"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-gray hover:bg-app-surface hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative pl-0 sm:pl-1">
            <div className="relative flex gap-3 sm:gap-4">
              <div className="absolute bottom-0 left-[19px] top-10 w-0.5 rounded-full bg-sand sm:left-[22px]" aria-hidden />
              <div
                className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-white sm:h-11 sm:w-11 ${
                  live.kind === "prayer"
                    ? "bg-pastel-blue-light text-foreground ring-sand"
                    : "bg-[#FFF6DD] text-foreground ring-sand"
                }`}
              >
                {feedAvatarLetter(live.authorName, live.content)}
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-semibold text-foreground">
                    {live.authorName}
                  </span>
                  <span className="text-gray">·</span>
                  <time
                    dateTime={live.createdAt}
                    className="text-xs text-gray sm:text-sm"
                  >
                    {formatFeedTime(live.createdAt)}
                  </time>
                </header>
                <p
                  className="mt-3 whitespace-pre-wrap text-xl leading-relaxed text-foreground sm:text-2xl"
                  style={{
                    fontFamily: "var(--font-caveat), cursive",
                  }}
                >
                  {live.content}
                </p>
              </div>
            </div>

            <div className={`mt-4 border-t border-sand pt-4 ${THREAD_INDENT}`}>
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray">
                Join in
              </p>
              {live.kind === "prayer" ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      className={actionBtnClass(live.viewer.pray, busy)}
                      aria-label={`Pray — ${live.counts.pray} ${live.counts.pray === 1 ? "person" : "people"}`}
                      onClick={() =>
                        postPrayerInteraction(live.id, { kind: "PRAY" })
                      }
                    >
                      <IconPrayer className={ACTION_ICON} />
                      <span>Pray</span>
                      <span className="tabular-nums text-gray">
                        {live.counts.pray}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className={actionBtnClass(!!live.viewer.encourage, busy)}
                      aria-label={`Encourage — ${live.counts.encourage} ${live.counts.encourage === 1 ? "encouragement" : "encouragements"}`}
                      onClick={() =>
                        setOpenEncourage((o) => !o)
                      }
                    >
                      <IconEncourage className={ACTION_ICON} />
                      <span>Encourage</span>
                      <span className="tabular-nums text-gray">
                        {live.counts.encourage}
                      </span>
                    </button>
                  </div>
                  {openEncourage && (
                    <EncourageForm
                      initial={live.viewer.encourage}
                      busy={busy}
                      onClose={() => setOpenEncourage(false)}
                      onSubmit={(body) => postPrayerInteraction(live.id, body)}
                    />
                  )}
                </>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    className={actionBtnClass(live.viewer.celebrated, busy)}
                    aria-label={`Celebrate — ${live.counts.celebrate} ${live.counts.celebrate === 1 ? "person" : "people"}`}
                    onClick={() => toggleCelebrate(live.id)}
                  >
                    <IconCelebrate className={ACTION_ICON} />
                    <span>Celebrate</span>
                    <span className="tabular-nums text-gray">
                      {live.counts.celebrate}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <CommunityPostDiscussionPanel
              item={live}
              defaultCommentName={defaultCommentName}
              onCommentCountUpdate={(next) =>
                setLive((cur) => (cur ? { ...cur, commentCount: next } : cur))
              }
              className="mt-5 border-t border-sand pt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
