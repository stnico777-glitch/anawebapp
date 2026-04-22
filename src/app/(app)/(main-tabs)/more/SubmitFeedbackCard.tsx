"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { DAY_CARD_SHELL_HOVER, SABBATH_CARD_SUBTITLE_CLASS } from "@/constants/dayCardVisual";

type Phase = "idle" | "submitting" | "sent" | "error";

export default function SubmitFeedbackCard({
  isGuest,
}: {
  /** When true we collect a reply-to email from the submitter. */
  isGuest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    /** Reset after the close animation would finish (short delay is fine). */
    setTimeout(() => {
      setPhase("idle");
      setErrorText(null);
      setTitle("");
      setMessage("");
      setEmail("");
    }, 200);
  }, []);

  /** Focus the first field + lock body scroll while the modal is open. */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => titleInputRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, closeModal]);

  const canSubmit =
    title.trim().length > 0 && message.trim().length > 0 && phase !== "submitting";

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setPhase("submitting");
      setErrorText(null);
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            title: title.trim(),
            message: message.trim(),
            email: isGuest ? email.trim() || undefined : undefined,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setErrorText(data?.error ?? "Something went wrong. Please try again.");
          setPhase("error");
          return;
        }
        setPhase("sent");
      } catch {
        setErrorText("Network issue. Please try again.");
        setPhase("error");
      }
    },
    [canSubmit, title, message, email, isGuest],
  );

  return (
    <>
      {/* Wide banner card. Same visual language as the old Sabbath tile
          (peach wash, birds, white caption strip) but stretched horizontally. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Submit feedback — open the feedback form"
        className={`group relative flex h-[min(200px,42vw)] w-full flex-row overflow-hidden rounded-none bg-sunset-peach ring-1 ring-accent-amber/45 ${DAY_CARD_SHELL_HOVER} text-left sm:h-52 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 50%, rgb(255 206 168 / 0.45) 0%, rgb(255 228 208 / 0.18) 55%, transparent 78%)",
          }}
          aria-hidden
        />
        <div className="relative flex h-full shrink-0 items-center justify-center px-4 sm:px-6">
          <div className="relative h-20 w-24 shrink-0 origin-center scale-105 sm:h-28 sm:w-32">
            <Image
              src="/sabbath-birds.png"
              alt=""
              fill
              className="object-contain object-center"
              sizes="128px"
              priority={false}
            />
          </div>
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col justify-center pr-4 sm:pr-6">
          <p className="text-lg font-light tracking-tight text-foreground sm:text-xl md:text-2xl [font-family:var(--font-headline),sans-serif]">
            Submit feedback
          </p>
          <p className={`${SABBATH_CARD_SUBTITLE_CLASS} !mt-1 opacity-95 sm:text-sm`}>
            Tell us what&apos;s working, what isn&apos;t, or a feature you&rsquo;d love to see.
          </p>
          <span
            className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-blue shadow-sm sm:text-sm [font-family:var(--font-body),sans-serif]"
            aria-hidden
          >
            Share yours
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>

      {/* Modal — rendered via portal so it escapes any overflow containers. */}
      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-modal-title"
              onClick={closeModal}
            >
              <div
                className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-sand bg-white shadow-2xl sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="flex shrink-0 items-center justify-between gap-2 border-b border-sand px-4 py-3">
                  <h2
                    id="feedback-modal-title"
                    className="text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]"
                  >
                    {phase === "sent" ? "Thank you" : "Submit feedback"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full p-1.5 text-gray transition hover:bg-sand/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </header>

                {phase === "sent" ? (
                  <div className="flex flex-col items-center gap-3 px-5 py-10 text-center [font-family:var(--font-body),sans-serif]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-blue/10 text-sky-blue">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                      We got it.
                    </p>
                    <p className="max-w-sm text-sm leading-relaxed text-gray">
                      Thanks for sharing — your feedback just landed in our inbox. We read every note and will follow
                      up personally when it helps.
                    </p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-4 inline-flex min-w-[8rem] items-center justify-center rounded-md bg-sky-blue px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 py-4 [font-family:var(--font-body),sans-serif]">
                    <p className="mb-4 text-sm leading-relaxed text-gray">
                      Something broken? A feature you want? A rhythm that helped you? Tell us — we read every note.
                    </p>

                    <label className="block text-xs font-medium text-gray">
                      Title
                      <input
                        ref={titleInputRef}
                        type="text"
                        required
                        maxLength={140}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Add a streak counter"
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
                      />
                    </label>

                    <label className="mt-3 block text-xs font-medium text-gray">
                      Message
                      <textarea
                        required
                        maxLength={4000}
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What would you love to see?"
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
                      />
                    </label>

                    {isGuest ? (
                      <label className="mt-3 block text-xs font-medium text-gray">
                        Your email <span className="font-normal text-gray/70">(optional — so we can reply)</span>
                        <input
                          type="email"
                          maxLength={200}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
                        />
                      </label>
                    ) : null}

                    {errorText ? (
                      <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorText}
                      </p>
                    ) : null}

                    <div className="mt-5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex min-w-[6.5rem] items-center justify-center rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 disabled:opacity-50"
                      >
                        {phase === "submitting" ? "Sending…" : "Send"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
