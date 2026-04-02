"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Example Chat component usage:
 *
 * const { showTyping, typingFading, visibleMessages } = useChatSequence({
 *   enabled: isModalVisible,
 *   messageCount: 3,
 * });
 *
 * return (
 *   <div>
 *     {visibleMessages.map((id) => (
 *       <div key={id} className="chat-sequence-msg-enter">...</div>
 *     ))}
 *     {showTyping && (
 *       <div className={`chat-sequence-typing ${typingFading ? "chat-sequence-typing-fade-out" : ""}`}>
 *         <TypingDots />
 *       </div>
 *     )}
 *   </div>
 * );
 */

/** iMessage-style timing constants (deterministic, no race conditions) */
const TYPING_DURATION_MS = 3200;
const TYPING_FADE_MS = 150;
const MICRO_DELAY_MS = 20;
const MESSAGE_ENTRANCE_MS = 250;
const GAP_BEFORE_NEXT_TYPING_MS = 350;

export type ChatSequencePhase = "typing" | "sending" | "complete";

export interface UseChatSequenceOptions {
  /** Total number of messages to reveal (default 3) */
  messageCount?: number;
  /** Start sequence when true (e.g. when modal is visible) */
  enabled?: boolean;
  /** Keep current progress when hidden instead of resetting */
  preserveOnDisable?: boolean;
  /** If true, sequence can restart each time enabled flips true */
  restartOnEnable?: boolean;
}

export interface UseChatSequenceResult {
  /** Show typing indicator (unmount after fade completes) */
  showTyping: boolean;
  /** True while typing indicator is fading out (150ms ease-out) */
  typingFading: boolean;
  /** Message ids that should be visible (entrance animation runs when id is added) */
  visibleMessages: number[];
  phase: ChatSequencePhase;
}

/**
 * Orchestrates iMessage-style chat sequence:
 * typing → msg1 → typing → msg2 → typing → msg3
 * Typing shows for TYPING_DURATION_MS, fades 150ms, then message appears.
 * All timeouts cleared on unmount.
 */
export function useChatSequence(
  options: UseChatSequenceOptions = {}
): UseChatSequenceResult {
  const {
    messageCount = 3,
    enabled = true,
    preserveOnDisable = false,
    restartOnEnable = true,
  } = options;

  const [showTyping, setShowTyping] = useState(false);
  const [typingFading, setTypingFading] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [phase, setPhase] = useState<ChatSequencePhase>("typing");

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const hasStartedRef = useRef(false);

  const clearAll = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const schedule = (fn: () => void, ms: number) => {
    if (!mountedRef.current) return;
    const id = setTimeout(() => {
      if (!mountedRef.current) return;
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  };

  const scheduleMessage = (id: number) => {
    if (!mountedRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!mountedRef.current) return;
      setVisibleMessages((prev) => (prev.includes(id) ? prev : [...prev, id]));
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (preserveOnDisable) return;
      setShowTyping(false);
      setTypingFading(false);
      setVisibleMessages([]);
      setPhase("typing");
      clearAll();
      hasStartedRef.current = false;
      return;
    }

    if (!restartOnEnable && hasStartedRef.current) return;

    clearAll();

    setShowTyping(true);
    setTypingFading(false);
    setVisibleMessages([]);
    setPhase("typing");
    hasStartedRef.current = true;

    // —— Block 1: typing → message 0
    schedule(() => setTypingFading(true), TYPING_DURATION_MS);
    schedule(() => {
      setShowTyping(false);
      setTypingFading(false);
      setPhase("sending");
      schedule(() => scheduleMessage(0), MICRO_DELAY_MS);
    }, TYPING_DURATION_MS + TYPING_FADE_MS);

    const afterMsg0 =
      TYPING_DURATION_MS +
      TYPING_FADE_MS +
      MICRO_DELAY_MS +
      MESSAGE_ENTRANCE_MS +
      GAP_BEFORE_NEXT_TYPING_MS;

    // —— Block 2: typing → message 1
    schedule(() => setShowTyping(true), afterMsg0);
    schedule(() => setTypingFading(true), afterMsg0 + TYPING_DURATION_MS);
    schedule(() => {
      setShowTyping(false);
      setTypingFading(false);
      schedule(() => scheduleMessage(1), MICRO_DELAY_MS);
    }, afterMsg0 + TYPING_DURATION_MS + TYPING_FADE_MS);

    const afterMsg1 =
      afterMsg0 +
      TYPING_DURATION_MS +
      TYPING_FADE_MS +
      MICRO_DELAY_MS +
      MESSAGE_ENTRANCE_MS +
      GAP_BEFORE_NEXT_TYPING_MS;

    // —— Block 3: typing → message 2
    schedule(() => setShowTyping(true), afterMsg1);
    schedule(() => setTypingFading(true), afterMsg1 + TYPING_DURATION_MS);
    schedule(() => {
      setShowTyping(false);
      setTypingFading(false);
      schedule(() => scheduleMessage(2), MICRO_DELAY_MS);
    }, afterMsg1 + TYPING_DURATION_MS + TYPING_FADE_MS);

    const completeAt =
      afterMsg1 +
      TYPING_DURATION_MS +
      TYPING_FADE_MS +
      MICRO_DELAY_MS +
      MESSAGE_ENTRANCE_MS;
    schedule(() => setPhase("complete"), completeAt);

    return clearAll;
  }, [enabled, messageCount, preserveOnDisable, restartOnEnable]);

  return { showTyping, typingFading, visibleMessages, phase };
}
