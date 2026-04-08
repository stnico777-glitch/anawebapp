"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useChatSequence } from "@/hooks/useChatSequence";
import {
  WELCOME_MODAL_SEEN_KEY,
  WELCOME_REOPEN_EVENT,
  WELCOME_BUBBLE_NUDGE_KEY,
  WELCOME_BUBBLE_SUCCESS_KEY,
  WELCOME_BUBBLE_PILL_DISMISSED_KEY,
  notifyWelcomeBubbleStorageChanged,
} from "@/lib/welcome-email-modal";

const KAT_BUBBLES = [
  "Hey girl!! Kat here, so proud of you for taking this step to grow in your fitness and faith journey. 💛",
  "A routine that sticks. Morning flows, prayer, and prayer & praise with others. Let's get you started.",
  "Drop your email below and I'll send you the free trial link.",
];
const SENDER = "Kat";
/** Reaction GIF shown after user sends email */
const REPLY_GIF_URL = "/email.gif";
const SENT_GIF_DELAY_MS = 2100;
const SENT_TYPING_AFTER_GIF_MS = 1800;
const SENT_TYPING_DURATION_MS = 2600;
/** After “drop your email…” bubble lands, brief pause (next “beat”) before the arrow — like a follow-up attachment */
const EMAIL_ARROW_AFTER_LAST_BUBBLE_MS = 720;
/** After Kat’s final reply (“Got it!…”), wait this long, then play exit animation */
const AUTO_MINIMIZE_AFTER_REPLY_MS = 4500;

export default function WelcomeMessageBubble() {
  const [visible, setVisible] = useState(false);
  const [exitAfterSuccess, setExitAfterSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [sentGifShown, setSentGifShown] = useState(false);
  const [sentTypingShown, setSentTypingShown] = useState(false);
  const [sentReplyShown, setSentReplyShown] = useState(false);
  const [emailArrowVisible, setEmailArrowVisible] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { showTyping, typingFading, visibleMessages } = useChatSequence({
    enabled: visible,
    messageCount: KAT_BUBBLES.length,
    preserveOnDisable: true,
    restartOnEnable: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.removeItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY);
    notifyWelcomeBubbleStorageChanged();
  }, [visible]);

  useEffect(() => {
    const onReopen = () => {
      setExitAfterSuccess(false);
      setVisible(true);
    };
    window.addEventListener(WELCOME_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(WELCOME_REOPEN_EVENT, onReopen);
  }, []);

  // Show the popup once the Instagram widget section comes into view.
  useEffect(() => {
    if (!mounted) return;
    if (sessionStorage.getItem(WELCOME_MODAL_SEEN_KEY)) return;

    const heading = document.getElementById("instagram-carousel-heading");
    const target = heading?.closest("section") ?? heading;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            sessionStorage.setItem(WELCOME_MODAL_SEEN_KEY, "1");
            notifyWelcomeBubbleStorageChanged();
            observer.disconnect();
          }
        });
      },
      { root: null, threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!sent) return;
    const t1 = setTimeout(() => setSentGifShown(true), SENT_GIF_DELAY_MS);
    const t2 = setTimeout(() => setSentTypingShown(true), SENT_GIF_DELAY_MS + SENT_TYPING_AFTER_GIF_MS);
    const t3 = setTimeout(() => {
      setSentTypingShown(false);
      setSentReplyShown(true);
    }, SENT_GIF_DELAY_MS + SENT_TYPING_AFTER_GIF_MS + SENT_TYPING_DURATION_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [sent]);

  useEffect(() => {
    if (!sent && !sentGifShown && !sentTypingShown && !sentReplyShown) return;
    const el = chatScrollRef.current;
    if (!el) return;
    const scrollToBottom = () => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    const ids = [80, 400, 900].map((ms) => window.setTimeout(scrollToBottom, ms));
    return () => ids.forEach((id) => clearTimeout(id));
  }, [sent, sentGifShown, sentTypingShown, sentReplyShown]);

  useEffect(() => {
    if (!sentReplyShown) return;
    const t = window.setTimeout(() => setExitAfterSuccess(true), AUTO_MINIMIZE_AFTER_REPLY_MS);
    return () => clearTimeout(t);
  }, [sentReplyShown]);

  const finishSuccessExit = () => {
    setExitAfterSuccess(false);
    setVisible(false);
    sessionStorage.setItem(WELCOME_MODAL_SEEN_KEY, "1");
    sessionStorage.removeItem(WELCOME_BUBBLE_NUDGE_KEY);
    sessionStorage.setItem(WELCOME_BUBBLE_SUCCESS_KEY, "1");
    sessionStorage.removeItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY);
    notifyWelcomeBubbleStorageChanged();
  };

  const handleSuccessExitAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!exitAfterSuccess) return;
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "welcome-bubble-out") return;
    finishSuccessExit();
  };

  const lastKatBubbleIndex = KAT_BUBBLES.length - 1;
  const lastKatBubbleVisible = visibleMessages.includes(lastKatBubbleIndex);

  useEffect(() => {
    if (!lastKatBubbleVisible) {
      setEmailArrowVisible(false);
      return;
    }
    if (!visible) return;
    const t = window.setTimeout(() => setEmailArrowVisible(true), EMAIL_ARROW_AFTER_LAST_BUBBLE_MS);
    return () => clearTimeout(t);
  }, [visible, lastKatBubbleVisible]);

  /** Arrow after delayed “send” beat; stays visible once shown (incl. after user sends) */
  const showEmailArrow = lastKatBubbleVisible && emailArrowVisible;

  // Scroll chat to latest bubbles before the user sends (arrow is in-flow below Kat’s thread).
  useEffect(() => {
    if (!visible || !lastKatBubbleVisible || sent) return;
    const el = chatScrollRef.current;
    if (!el) return;

    const scrollToBottom = () =>
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });

    // Run after the chat entrance animation (bubble landed).
    const t1 = window.setTimeout(scrollToBottom, 450);
    const t2 = window.setTimeout(scrollToBottom, 750);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollToBottom);
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [visible, lastKatBubbleVisible, sent]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(WELCOME_MODAL_SEEN_KEY, "1");
    sessionStorage.removeItem(WELCOME_BUBBLE_PILL_DISMISSED_KEY);
    if (sent) {
      sessionStorage.removeItem(WELCOME_BUBBLE_NUDGE_KEY);
      sessionStorage.setItem(WELCOME_BUBBLE_SUCCESS_KEY, "1");
    } else {
      sessionStorage.setItem(WELCOME_BUBBLE_NUDGE_KEY, "1");
      sessionStorage.removeItem(WELCOME_BUBBLE_SUCCESS_KEY);
    }
    notifyWelcomeBubbleStorageChanged();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const value = reply.trim();
    if (!value) return;
    setSentMessage(value);
    setSent(true);
    setReply("");
  };

  if (!visible) return null;

  return createPortal(
    <div
      className={`welcome-bubble-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 ${
        exitAfterSuccess ? "animate-modal-backdrop-out pointer-events-none" : "animate-modal-backdrop-in"
      }`}
      aria-hidden
      onClick={exitAfterSuccess ? undefined : dismiss}
    >
      <div
        className={`welcome-bubble relative flex h-[700px] max-h-[calc(100vh-3rem)] w-[min(375px,100%)] flex-col overflow-hidden rounded-[2rem] bg-transparent font-[family-name:var(--font-body),sans-serif] shadow-2xl ring-1 ring-black/10 ${
          exitAfterSuccess ? "animate-welcome-bubble-out" : "animate-welcome-bubble-in"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Message from Kat"
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleSuccessExitAnimationEnd}
      >
        {/* Glow layer — first child, fills entire modal including very bottom edge */}
        <div
          className="absolute inset-0 z-0 pointer-events-none rounded-[2rem]"
          aria-hidden
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.98) 0%,
                rgba(255, 255, 255, 0.9) 55%,
                rgba(255, 255, 255, 0.55) 78%,
                rgba(255, 255, 255, 0.12) 100%
              ),
              radial-gradient(
                ellipse 150% 125% at 50% 102%,
                rgba(255, 230, 185, 0.72) 0%,
                rgba(255, 238, 210, 0.45) 28%,
                rgba(254, 250, 240, 0.16) 52%,
                transparent 76%
              ),
              radial-gradient(
                ellipse 110% 82% at 50% 102%,
                rgba(255, 242, 205, 0.78) 0%,
                rgba(255, 235, 198, 0.4) 42%,
                transparent 68%
              )
            `,
          }}
        >
          <div
            className="absolute inset-0 rounded-[2rem] animate-welcome-glow"
            style={{
              background: "radial-gradient(ellipse 100% 90% at 50% 100%, rgba(255, 240, 210, 0.4) 0%, transparent 55%)",
            }}
          />
        </div>

        {/* Header: overlays chat with gradient fade — transparent at bottom, white at top */}
        <div className="absolute left-0 right-0 top-0 z-20 min-h-[132px]">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent"
            aria-hidden
          />
          {/* iOS-style status bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-1 text-[12px] font-bold text-[#000000]">
            <span className="ml-2 tabular-nums text-[13px] font-bold text-[#000000]">N:OW</span>
            <div className="flex items-center gap-1.5">
              <svg className="h-3 w-3.5" viewBox="0 0 14 10" fill="currentColor" aria-hidden>
                <rect x="0" y="6" width="2" height="4" rx="0.4" />
                <rect x="3.5" y="4" width="2" height="6" rx="0.4" />
                <rect x="7" y="2" width="2" height="8" rx="0.4" />
                <rect x="10.5" y="0" width="2" height="10" rx="0.4" />
              </svg>
              <span className="text-[12px] font-bold">5G</span>
              <span className="tabular-nums text-[12px] font-bold">77%</span>
            </div>
          </div>
          {/* Back | initials + name bubble | FaceTime */}
          <div className="relative z-10 flex items-start justify-between px-3 pt-2 pb-1.5">
          <button
            type="button"
            onClick={dismiss}
            className="relative z-10 flex items-center gap-1 rounded-full bg-white pl-2 pr-2.5 py-2 text-[#000000] shadow-sm ring-1 ring-black/5 transition hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#000000] text-[11px] font-semibold text-white" aria-hidden>7</span>
          </button>

          <div className="relative z-10 flex flex-col items-center -mt-3">
            <div
              className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C4B5D4]"
              aria-hidden
            >
              <span className="text-2xl font-bold text-white">{SENDER.charAt(0)}</span>
            </div>
            <button
              type="button"
              className="relative z-0 -mt-1.5 flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[15px] font-bold text-[#000000] shadow-sm ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50"
              aria-label="View contact"
            >
              {SENDER}
              <svg className="h-3 w-3 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#000000] shadow-md ring-1 ring-[#C6C6C8]/60 transition hover:bg-[#F2F2F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50"
            aria-label="FaceTime"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          </div>
        </div>

        <div ref={chatScrollRef} className="relative flex flex-1 flex-col overflow-y-auto bg-transparent min-h-0 pt-[132px]">
          <div className="relative z-10 flex flex-col min-h-0">
          <p className="py-3 text-center text-[11px] font-medium text-[#8E8E93]">Today 2:12 PM</p>

          <div className="flex flex-col items-start gap-1.5 px-3 pb-2">
            {visibleMessages.map((id) => (
              <div key={id} className="flex justify-start chat-sequence-msg-enter">
                <div className="relative max-w-[min(82%,260px)] rounded-[18px] bg-[#E5E5EA] px-4 py-2.5">
                  <p className="text-[15px] leading-[1.35] text-[#000000] hyphens-none">{KAT_BUBBLES[id]}</p>
                </div>
              </div>
            ))}

            {showTyping && (
              <div
                className={`flex justify-start chat-sequence-typing ${typingFading ? "chat-sequence-typing-fade-out" : ""}`}
              >
                <div className="relative rounded-[18px] bg-[#E5E5EA] px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                    <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {showEmailArrow && (
            <div className="pointer-events-none flex justify-start px-3 pb-2 pt-0.5 sm:px-3">
              <div
                className="welcome-email-arrow-in h-[140px] w-[140px] shrink-0 drop-shadow-sm"
                style={{
                  backgroundColor: "#788287",
                  maskImage: "url('/welcome-email-arrow.png')",
                  WebkitMaskImage: "url('/welcome-email-arrow.png')",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center bottom",
                  WebkitMaskPosition: "center bottom",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
                aria-hidden
              />
            </div>
          )}

          {sent && (
            <>
              <div className="flex flex-col items-end px-3 pb-0.5 pt-2">
                <div className="relative max-w-[min(82%,260px)] rounded-[18px] bg-[#007AFF] px-4 py-2.5">
                  <p className="text-[15px] leading-[1.35] text-white break-all hyphens-none">{sentMessage}</p>
                </div>
                <p className="mt-0.5 text-[10px] text-[#8E8E93]">Delivered</p>
              </div>
              {sentGifShown && (
                <div className="flex justify-start px-3 pb-1 pt-1 chat-sequence-msg-enter">
                  <div className="relative max-w-[min(82%,260px)] overflow-hidden rounded-[18px] bg-[#E5E5EA] p-1">
                    <img
                      src={REPLY_GIF_URL}
                      alt=""
                      className="max-h-[140px] w-auto rounded-[14px] object-cover"
                      width={200}
                      height={140}
                    />
                  </div>
                </div>
              )}
              {sentTypingShown && (
                <div className="flex justify-start px-3 pb-1 pt-1">
                  <div className="relative rounded-[18px] bg-[#E5E5EA] px-4 py-3">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#8E8E93] animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
                    </span>
                  </div>
                </div>
              )}
              {sentReplyShown && (
                <div className="flex justify-start px-3 pb-1 pt-1 chat-sequence-msg-enter">
                  <div className="relative max-w-[min(82%,260px)] rounded-[18px] bg-[#E5E5EA] px-4 py-2.5">
                    <p className="text-[15px] leading-[1.35] text-[#000000] hyphens-none">
                      Got it! I'll send you the free trial link soon 💛
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        <div className="relative shrink-0 z-10 px-3 pt-1 pb-2.5">
          <div className="relative z-10 flex justify-center pb-2" aria-hidden>
            <div
              className="h-14 w-14 shrink-0 opacity-[0.92]"
              style={{
                backgroundColor: "#788287",
                maskImage: "url('/schedule-sun-outline.png')",
                WebkitMaskImage: "url('/schedule-sun-outline.png')",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1C1C1E] shadow-sm ring-1 ring-[#C6C6C8]/60 transition hover:bg-[#F2F2F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/50"
              aria-label="Add attachment"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <label htmlFor="welcome-reply" className="sr-only">Reply with your email</label>
            <input
              id="welcome-reply"
              type="email"
              inputMode="email"
              placeholder="iMessage"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={sent}
              className="min-h-[28px] flex-1 rounded-[20px] bg-white px-4 py-1.5 text-[15px] text-[#000000] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 border border-[#C6C6C8]/50"
            />
            <button
              type="submit"
              disabled={sent || !reply.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white transition hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F7]"
              aria-label="Send"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-7 7h4v9h6v-9h4l-7-7z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
