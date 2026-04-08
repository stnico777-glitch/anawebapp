"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import LockIcon from "@/components/LockIcon";

function avatarLetter(name: string, content: string, kind: "prayer" | "praise") {
  const n = name.trim();
  if (n.length > 0) return n[0]!.toUpperCase();
  const c = content.trim();
  if (c.length > 0) return c[0]!.toUpperCase();
  return kind === "prayer" ? "P" : "W";
}

type PanelStep = "choose" | "form";

export default function PrayerPraiseComposer({
  defaultDisplayName,
  isGuest = false,
}: {
  defaultDisplayName?: string;
  isGuest?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PanelStep>("choose");
  const [kind, setKind] = useState<"prayer" | "praise">("prayer");

  const [prayerContent, setPrayerContent] = useState("");
  const [prayerName, setPrayerName] = useState(() => defaultDisplayName ?? "");
  const [praiseContent, setPraiseContent] = useState("");
  const [praiseName, setPraiseName] = useState(() => defaultDisplayName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = kind === "prayer" ? prayerContent : praiseContent;
  const setContent = kind === "prayer" ? setPrayerContent : setPraiseContent;
  const name = kind === "prayer" ? prayerName : praiseName;
  const setName = kind === "prayer" ? setPrayerName : setPraiseName;

  const initial = avatarLetter(name, content, kind);

  const canPost = useMemo(
    () => content.trim().length > 0 && !loading,
    [content, loading],
  );

  const maxLen = 2000;
  const len = content.length;

  const closeAll = useCallback(() => {
    setOpen(false);
    setStep("choose");
    setError(null);
  }, []);

  function openFab() {
    if (isGuest) {
      router.push("/register");
      return;
    }
    setOpen(true);
    setStep("choose");
    setError(null);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeAll]);

  async function submitPrayer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: prayerContent.trim(),
          authorName: prayerName.trim() || "Anonymous",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setPrayerContent("");
      closeAll();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  async function submitPraise(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/praise-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: praiseContent.trim(),
          authorName: praiseName.trim() || "Anonymous",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setPraiseContent("");
      closeAll();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <div
          className="fixed z-40 flex max-w-[min(18rem,calc(100vw-5.5rem))] items-center gap-3"
          style={{
            left: "max(1.5rem, env(safe-area-inset-left, 0px))",
            bottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <button
            type="button"
            onClick={openFab}
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-blue text-3xl font-light leading-none text-white shadow-lg ring-2 ring-white/90 transition hover:bg-sky-blue/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
            aria-label={isGuest ? "Sign up to post prayer or praise" : "New prayer or praise post"}
            aria-describedby="community-fab-hint"
          >
            {isGuest ? (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 shadow ring-2 ring-white"
                aria-hidden
              >
                <LockIcon size="sm" className="text-white" />
              </span>
            ) : null}
            <span aria-hidden>+</span>
          </button>

          <div
            id="community-fab-hint"
            className="community-compose-hint-bubble relative mb-0.5 min-w-0 rounded-2xl rounded-bl-md border border-sand bg-white px-3.5 py-2.5 shadow-md sm:px-4 sm:py-3"
            role="note"
          >
            <span
              className="absolute left-0 top-1/2 z-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-sand bg-white"
              aria-hidden
            />
            <p className="relative z-[1] text-left text-xs font-medium leading-snug text-foreground [font-family:var(--font-body),sans-serif] sm:text-[13px]">
              {isGuest ? (
                <>
                  <span className="block">Preview the wall</span>
                  <span className="mt-0.5 block text-gray">
                    Sign up to share prayer or praise — tap{" "}
                    <span className="font-semibold text-sky-blue">+</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block">Submit a prayer request</span>
                  <span className="mt-0.5 block text-gray">
                    or report praise — tap{" "}
                    <span className="font-semibold text-sky-blue">+</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-compose-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAll();
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-sand bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-white px-4 py-3 sm:px-5">
              <h2
                id="community-compose-title"
                className="text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]"
              >
                {step === "choose"
                  ? "Share with the community"
                  : kind === "prayer"
                    ? "Prayer request"
                    : "Praise report"}
              </h2>
              <button
                type="button"
                onClick={closeAll}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-gray hover:bg-app-surface hover:text-foreground"
              >
                Close
              </button>
            </div>

            {step === "choose" ? (
              <div className="space-y-3 p-4 sm:p-5">
                <p className="text-sm text-gray">
                  What would you like to share?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setKind("prayer");
                    setStep("form");
                    setError(null);
                  }}
                  className="flex w-full flex-col items-start rounded-xl border-2 border-sand bg-app-surface/80 px-4 py-4 text-left transition hover:border-sky-blue/50 hover:bg-white"
                >
                  <span className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                    Submit a prayer request
                  </span>
                  <span className="mt-1 text-xs text-gray">
                    Ask others to pray with you about something on your heart.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKind("praise");
                    setStep("form");
                    setError(null);
                  }}
                  className="flex w-full flex-col items-start rounded-xl border-2 border-sand bg-app-surface/80 px-4 py-4 text-left transition hover:border-accent-amber/60 hover:bg-white"
                >
                  <span className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                    Share a praise report
                  </span>
                  <span className="mt-1 text-xs text-gray">
                    Celebrate gratitude, answered prayer, or a win worth naming.
                  </span>
                </button>
              </div>
            ) : (
              <form
                className="p-4 sm:p-5"
                onSubmit={kind === "prayer" ? submitPrayer : submitPraise}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("choose");
                    setError(null);
                  }}
                  className="mb-4 text-sm font-medium text-sky-blue hover:underline"
                >
                  ← Back to choices
                </button>

                <div className="flex gap-3 sm:gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pastel-blue-light text-sm font-semibold text-foreground ring-1 ring-sand sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="sr-only">
                      {kind === "prayer" ? "Prayer request" : "Praise report"}
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        kind === "prayer"
                          ? "What would you like people to pray with you about?"
                          : "What are you grateful for — an answered prayer or a win?"
                      }
                      rows={5}
                      maxLength={maxLen}
                      autoFocus
                      className="w-full resize-y rounded-lg border border-sand bg-app-surface/60 px-3 py-2.5 text-base leading-relaxed text-foreground placeholder:text-gray/70 focus:border-pastel-blue focus:outline-none focus:ring-1 focus:ring-pastel-blue"
                    />

                    <div className="mt-4 flex flex-col gap-3 border-t border-sand/80 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <label className="sr-only">How your name appears</label>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="shrink-0 text-gray">Appear as</span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Anonymous"
                            maxLength={100}
                            className="min-w-0 flex-1 rounded-lg border border-sand bg-white px-2 py-1.5 text-foreground placeholder:text-gray/60 focus:border-pastel-blue focus:outline-none focus:ring-1 focus:ring-pastel-blue sm:max-w-[14rem]"
                          />
                        </div>
                        {error && (
                          <p className="mt-2 text-sm text-accent-pink" role="alert">
                            {error}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`text-xs tabular-nums ${
                            len > maxLen - 200 ? "text-gray" : "text-gray/70"
                          } ${len >= maxLen ? "text-accent-pink" : ""}`}
                        >
                          {len} / {maxLen}
                        </span>
                        <button
                          type="submit"
                          disabled={!canPost}
                          className="rounded-full bg-sky-blue px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? "Posting…" : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
