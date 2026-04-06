"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CommunityFeedItem,
  CommunityFeedPrayerItem,
  CommunityFeedPraiseItem,
} from "@/lib/community-feed";
import CommunityPostDiscussionPanel from "./CommunityPostDiscussionPanel";
import {
  ENCOURAGE_PRESETS,
  labelForEncouragePreset,
} from "@/constants/community";
import {
  IconCelebrate,
  IconComment,
  IconEncourage,
  IconPrayer,
} from "@/components/CommunityIcons";

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
    year:
      d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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

const ACTION_ICON = "h-4 w-4 shrink-0 opacity-[0.92]";

function actionBtnClass(active: boolean, busy?: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:text-sm";
  if (busy) return `${base} cursor-wait border-transparent bg-transparent text-gray/60`;
  if (active)
    return `${base} border-sky-blue/40 bg-sky-blue/10 text-foreground`;
  return `${base} border-transparent bg-transparent text-foreground hover:bg-app-surface`;
}

type FeedView = "prayer" | "praise" | "groups";

const FEED_PAGE_SIZE = 10;

function feedItemKey(item: CommunityFeedItem): string {
  return `${item.kind}-${item.id}`;
}

export default function PrayerPraiseFeed({
  items: initialItems,
  className = "",
  defaultCommentName,
}: {
  items: CommunityFeedItem[];
  className?: string;
  defaultCommentName?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [feedView, setFeedView] = useState<FeedView>("prayer");
  const [prayerPage, setPrayerPage] = useState(0);
  const [praisePage, setPraisePage] = useState(0);
  const [openEncourageId, setOpenEncourageId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedFeedKey, setExpandedFeedKey] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setExpandedFeedKey(null);
  }, [feedView]);

  useEffect(() => {
    if (!expandedFeedKey || !expandedRef.current) return;
    expandedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [expandedFeedKey]);

  useEffect(() => {
    if (!expandedFeedKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedFeedKey(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedFeedKey]);

  const prayersSorted = useMemo(() => {
    return items
      .filter((i): i is CommunityFeedPrayerItem => i.kind === "prayer")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items]);

  const praisesSorted = useMemo(() => {
    return items
      .filter((i): i is CommunityFeedPraiseItem => i.kind === "praise")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items]);

  const prayerTotalPages = Math.max(
    1,
    Math.ceil(prayersSorted.length / FEED_PAGE_SIZE),
  );
  const praiseTotalPages = Math.max(
    1,
    Math.ceil(praisesSorted.length / FEED_PAGE_SIZE),
  );

  const prayerPageSafe = Math.min(prayerPage, prayerTotalPages - 1);
  const praisePageSafe = Math.min(praisePage, praiseTotalPages - 1);

  const prayerSlice = useMemo(() => {
    const start = prayerPageSafe * FEED_PAGE_SIZE;
    return prayersSorted.slice(start, start + FEED_PAGE_SIZE);
  }, [prayersSorted, prayerPageSafe]);

  const praiseSlice = useMemo(() => {
    const start = praisePageSafe * FEED_PAGE_SIZE;
    return praisesSorted.slice(start, start + FEED_PAGE_SIZE);
  }, [praisesSorted, praisePageSafe]);

  useEffect(() => {
    setPrayerPage((p) => Math.min(p, Math.max(0, prayerTotalPages - 1)));
  }, [prayerTotalPages]);

  useEffect(() => {
    setPraisePage((p) => Math.min(p, Math.max(0, praiseTotalPages - 1)));
  }, [praiseTotalPages]);

  async function postPrayerInteraction(
    prayerId: string,
    body: Record<string, unknown>,
  ) {
    setBusyId(prayerId);
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
      setItems((prev) =>
        prev.map((it) =>
          it.kind === "prayer" && it.id === prayerId
            ? { ...it, counts: snap.counts, viewer: snap.viewer }
            : it,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function toggleCelebrate(praiseId: string) {
    setBusyId(praiseId);
    try {
      const res = await fetch(`/api/praise-reports/${praiseId}/celebrate`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | CelebrateResponse
        | { error?: string };
      if (!res.ok || !data || "error" in data) return;
      const snap = data as CelebrateResponse;
      setItems((prev) =>
        prev.map((it) =>
          it.kind === "praise" && it.id === praiseId
            ? {
                ...it,
                counts: { celebrate: snap.count },
                viewer: { celebrated: snap.viewerCelebrated },
              }
            : it,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  const viewTab = (id: FeedView, label: string) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={feedView === id}
      onClick={() => setFeedView(id)}
      className={`relative shrink-0 px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
        feedView === id
          ? "text-foreground"
          : "text-gray hover:text-foreground"
      }`}
    >
      {label}
      {feedView === id && (
        <span
          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-sky-blue sm:left-4 sm:right-4"
          aria-hidden
        />
      )}
    </button>
  );

  const pageBtnClass =
    "rounded-md border border-sand bg-white px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-app-surface disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={className}>
      <div
        className="flex flex-wrap border-b border-sand px-2 sm:flex-nowrap sm:overflow-x-auto sm:px-3"
        role="tablist"
        aria-label="Prayer, praise, or groups"
      >
        {viewTab("prayer", "Prayer")}
        {viewTab("praise", "Praise")}
        {viewTab("groups", "Groups")}
      </div>

      {feedView === "groups" ? (
        <div className="px-5 py-14 text-center sm:py-16">
          <p className="text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
            Groups
          </p>
          <p className="mt-2 max-w-sm mx-auto text-sm leading-relaxed text-gray">
            Coming soon — a space for smaller circles to pray and celebrate
            together.
          </p>
        </div>
      ) : feedView === "prayer" ? (
        <div className="min-w-0">
          <section className="flex min-h-0 min-w-0 flex-col" aria-label="Prayer requests">
            <header className="border-b border-sand bg-pastel-blue-light/35 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-foreground">Prayer</h2>
              <p className="mt-0.5 text-xs text-gray">
                {prayersSorted.length}{" "}
                {prayersSorted.length === 1 ? "post" : "posts"} · up to{" "}
                {FEED_PAGE_SIZE} per page
              </p>
            </header>
            <ul className="min-h-[4rem] divide-y divide-sand">
              {prayerSlice.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-gray sm:px-5">
                  {items.length === 0
                    ? "Nothing here yet. Use the + button to post a prayer."
                    : "No prayer requests yet."}
                </li>
              ) : (
                prayerSlice.map((item) => {
                  const rowKey = feedItemKey(item);
                  const isExpanded = expandedFeedKey === rowKey;
                  return (
              <li key={`prayer-${item.id}`} className="w-full">
                <article className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pastel-blue-light text-sm font-semibold text-foreground ring-1 ring-sand sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    {feedAvatarLetter(item.authorName, item.content)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`${item.authorName}'s prayer. ${isExpanded ? "Collapse" : "Expand"} discussion.`}
                      className="cursor-pointer rounded-lg outline-none transition hover:bg-app-surface/70 sm:-mx-2 sm:px-2 sm:py-1 focus-visible:ring-2 focus-visible:ring-sky-blue"
                      onClick={() =>
                        setExpandedFeedKey((cur) =>
                          cur === rowKey ? null : rowKey,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedFeedKey((cur) =>
                            cur === rowKey ? null : rowKey,
                          );
                        }
                      }}
                    >
                      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-foreground">
                          {item.authorName}
                        </span>
                        <span className="text-gray">·</span>
                        <time
                          dateTime={item.createdAt}
                          className="text-xs text-gray sm:text-sm"
                        >
                          {formatFeedTime(item.createdAt)}
                        </time>
                        <span className="ml-auto rounded-full bg-sky-blue/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Prayer
                        </span>
                      </header>
                      <p
                        className="mt-2 whitespace-pre-wrap text-xl leading-relaxed text-foreground sm:text-2xl"
                        style={{
                          fontFamily: "var(--font-caveat), cursive",
                        }}
                      >
                        {item.content}
                      </p>
                    </div>

                    <div
                      className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        className={actionBtnClass(
                          item.viewer.pray,
                          busyId === item.id,
                        )}
                        aria-label={`Pray — ${item.counts.pray} ${item.counts.pray === 1 ? "person" : "people"}`}
                        onClick={() =>
                          postPrayerInteraction(item.id, { kind: "PRAY" })
                        }
                      >
                        <IconPrayer className={ACTION_ICON} />
                        <span>Pray</span>
                        <span className="tabular-nums text-gray">{item.counts.pray}</span>
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        className={actionBtnClass(
                          !!item.viewer.encourage,
                          busyId === item.id,
                        )}
                        aria-label={`Encourage — ${item.counts.encourage} ${item.counts.encourage === 1 ? "encouragement" : "encouragements"}`}
                        onClick={() =>
                          setOpenEncourageId((cur) =>
                            cur === item.id ? null : item.id,
                          )
                        }
                      >
                        <IconEncourage className={ACTION_ICON} />
                        <span>Encourage</span>
                        <span className="tabular-nums text-gray">
                          {item.counts.encourage}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`${actionBtnClass(false)} text-gray tabular-nums`}
                        title="View discussion and replies"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedFeedKey(rowKey)}
                      >
                        <IconComment className={ACTION_ICON} />
                        {item.commentCount}
                      </button>
                    </div>
                    {openEncourageId === item.id && (
                      <EncourageForm
                        initial={item.viewer.encourage}
                        busy={busyId === item.id}
                        onClose={() => setOpenEncourageId(null)}
                        onSubmit={(body) => postPrayerInteraction(item.id, body)}
                      />
                    )}
                    {isExpanded ? (
                      <div
                        ref={expandedRef}
                        className="mt-4 -mx-4 border-t border-sand bg-app-surface/45 px-4 py-4 sm:-mx-5 sm:px-5 sm:py-5"
                      >
                        <CommunityPostDiscussionPanel
                          item={item}
                          defaultCommentName={defaultCommentName}
                          align="flush"
                          onCommentCountUpdate={(next) =>
                            setItems((prev) =>
                              prev.map((it) =>
                                it.id === item.id && it.kind === "prayer"
                                  ? { ...it, commentCount: next }
                                  : it,
                              ),
                            )
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              </li>
                  );
                })
              )}
            </ul>
            <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sand bg-app-surface/25 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                className={pageBtnClass}
                disabled={prayerPageSafe <= 0}
                onClick={() => setPrayerPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="text-xs text-gray tabular-nums">
                Page {prayerPageSafe + 1} of {prayerTotalPages}
              </span>
              <button
                type="button"
                className={pageBtnClass}
                disabled={prayerPageSafe >= prayerTotalPages - 1}
                onClick={() =>
                  setPrayerPage((p) => Math.min(prayerTotalPages - 1, p + 1))
                }
              >
                Next
              </button>
            </footer>
          </section>
        </div>
      ) : (
        <div className="min-w-0">
          <section className="flex min-h-0 min-w-0 flex-col" aria-label="Praise reports">
            <header className="border-b border-sand bg-[#FFF6DD]/60 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-foreground">Praise</h2>
              <p className="mt-0.5 text-xs text-gray">
                {praisesSorted.length}{" "}
                {praisesSorted.length === 1 ? "post" : "posts"} · up to{" "}
                {FEED_PAGE_SIZE} per page
              </p>
            </header>
            <ul className="min-h-[4rem] divide-y divide-sand">
              {praiseSlice.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-gray sm:px-5">
                  {items.length === 0
                    ? "Nothing here yet. Use the + button to share praise."
                    : "No praise reports yet."}
                </li>
              ) : (
                praiseSlice.map((item) => {
                  const rowKey = feedItemKey(item);
                  const isExpanded = expandedFeedKey === rowKey;
                  return (
              <li key={`praise-${item.id}`} className="w-full">
                <article className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF6DD] text-sm font-semibold text-foreground ring-1 ring-sand sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    {feedAvatarLetter(item.authorName, item.content)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`${item.authorName}'s praise. ${isExpanded ? "Collapse" : "Expand"} discussion.`}
                      className="cursor-pointer rounded-lg outline-none transition hover:bg-app-surface/70 sm:-mx-2 sm:px-2 sm:py-1 focus-visible:ring-2 focus-visible:ring-sky-blue"
                      onClick={() =>
                        setExpandedFeedKey((cur) =>
                          cur === rowKey ? null : rowKey,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedFeedKey((cur) =>
                            cur === rowKey ? null : rowKey,
                          );
                        }
                      }}
                    >
                      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-foreground">
                          {item.authorName}
                        </span>
                        <span className="text-gray">·</span>
                        <time
                          dateTime={item.createdAt}
                          className="text-xs text-gray sm:text-sm"
                        >
                          {formatFeedTime(item.createdAt)}
                        </time>
                        <span className="ml-auto rounded-full bg-accent-amber/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          Praise
                        </span>
                      </header>
                      <p
                        className="mt-2 whitespace-pre-wrap text-xl leading-relaxed text-foreground sm:text-2xl"
                        style={{
                          fontFamily: "var(--font-caveat), cursive",
                        }}
                      >
                        {item.content}
                      </p>
                    </div>

                    <div
                      className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        className={actionBtnClass(
                          item.viewer.celebrated,
                          busyId === item.id,
                        )}
                        aria-label={`Celebrate — ${item.counts.celebrate} ${item.counts.celebrate === 1 ? "person" : "people"}`}
                        onClick={() => toggleCelebrate(item.id)}
                      >
                        <IconCelebrate className={ACTION_ICON} />
                        <span>Celebrate</span>
                        <span className="tabular-nums text-gray">{item.counts.celebrate}</span>
                      </button>
                      <button
                        type="button"
                        className={`${actionBtnClass(false)} text-gray tabular-nums`}
                        title="View discussion and replies"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedFeedKey(rowKey)}
                      >
                        <IconComment className={ACTION_ICON} />
                        {item.commentCount}
                      </button>
                    </div>
                    {isExpanded ? (
                      <div
                        ref={expandedRef}
                        className="mt-4 -mx-4 border-t border-sand bg-app-surface/45 px-4 py-4 sm:-mx-5 sm:px-5 sm:py-5"
                      >
                        <CommunityPostDiscussionPanel
                          item={item}
                          defaultCommentName={defaultCommentName}
                          align="flush"
                          onCommentCountUpdate={(next) =>
                            setItems((prev) =>
                              prev.map((it) =>
                                it.id === item.id && it.kind === "praise"
                                  ? { ...it, commentCount: next }
                                  : it,
                              ),
                            )
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              </li>
                  );
                })
              )}
            </ul>
            <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sand bg-app-surface/25 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                className={pageBtnClass}
                disabled={praisePageSafe <= 0}
                onClick={() => setPraisePage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="text-xs text-gray tabular-nums">
                Page {praisePageSafe + 1} of {praiseTotalPages}
              </span>
              <button
                type="button"
                className={pageBtnClass}
                disabled={praisePageSafe >= praiseTotalPages - 1}
                onClick={() =>
                  setPraisePage((p) => Math.min(praiseTotalPages - 1, p + 1))
                }
              >
                Next
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export function EncourageForm({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: { presetKey: string | null; message: string | null } | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [presetKey, setPresetKey] = useState<string | null>(
    initial?.presetKey ?? null,
  );
  const [message, setMessage] = useState(initial?.message ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPresetKey(initial?.presetKey ?? null);
    setMessage(initial?.message ?? "");
  }, [initial?.presetKey, initial?.message]);

  const canSave =
    !!presetKey || (message.trim().length > 0 && message.trim().length <= 200);

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSubmit({
        kind: "ENCOURAGE",
        presetKey: presetKey ?? null,
        message: message.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await onSubmit({ kind: "ENCOURAGE", remove: true });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-sand bg-app-surface/80 p-3">
      <p className="text-xs font-medium text-gray">Send encouragement</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ENCOURAGE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            disabled={busy || saving}
            onClick={() =>
              setPresetKey((cur) => (cur === p.key ? null : p.key))
            }
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              presetKey === p.key
                ? "border-sky-blue bg-sky-blue/15 text-foreground"
                : "border-sand bg-app-surface text-foreground hover:border-sky-blue/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label className="mt-2 block text-xs font-medium text-gray">
        Optional message
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={200}
        rows={2}
        disabled={busy || saving}
        placeholder="Add a short note…"
        className="mt-1 w-full resize-y rounded-sm border border-sand bg-white px-2 py-1.5 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || saving || !canSave}
          onClick={() => save()}
          className="rounded-sm bg-sky-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-blue/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save encouragement"}
        </button>
        {initial && (
          <button
            type="button"
            disabled={busy || saving}
            onClick={() => remove()}
            className="rounded-sm border border-sand bg-white px-3 py-1.5 text-xs font-medium text-gray hover:bg-app-surface disabled:opacity-60"
          >
            Remove mine
          </button>
        )}
        <button
          type="button"
          disabled={busy || saving}
          onClick={onClose}
          className="rounded-sm px-3 py-1.5 text-xs font-medium text-gray hover:text-foreground"
        >
          Close
        </button>
      </div>
      {initial?.presetKey || initial?.message ? (
        <p className="mt-2 text-[11px] text-gray">
          Your note:{" "}
          <span className="text-foreground">
            {[
              initial.presetKey ? labelForEncouragePreset(initial.presetKey) : null,
              initial.message,
            ]
              .filter(Boolean)
              .join(" — ")}
          </span>
        </p>
      ) : null}
    </div>
  );
}
