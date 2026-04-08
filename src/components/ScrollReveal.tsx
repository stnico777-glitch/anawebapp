"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Extra delay after the element is in view (ms), e.g. for stagger */
  delayMs?: number;
  threshold?: number;
  /** Passed to IntersectionObserver (CSS margin syntax on the root). */
  rootMargin?: string;
  /** Tailwind translate class while hidden (default slide-up distance). */
  translateHiddenClass?: string;
  /** Tailwind duration class for opacity/transform (e.g. duration-1000). */
  durationClass?: string;
  /** Tailwind timing / easing class (e.g. ease-out). */
  easeClass?: string;
  /**
   * Reserve bottom space while hidden (for tall slide-ins), then transition to `visible`
   * so layout doesn’t keep a huge gap after the animation.
   */
  runwayPadding?: { hidden: string; visible: string };
  /**
   * CSS length/expression for translateY when hidden — uses inline styles so motion always runs
   * (Tailwind arbitrary translate utilities can fail to emit for complex values).
   */
  hiddenSlideY?: string;
  /** Duration for opacity/transform (and inline runway padding). */
  motionDurationMs?: number;
  /** CSS timing function, e.g. cubic-bezier(0.16, 1, 0.3, 1) */
  motionEase?: string;
  /**
   * Inline padding-bottom runway (CSS lengths); pair with `hiddenSlideY` so space matches the slide.
   */
  runwayPaddingBottom?: { hidden: string; visible: string };
};

/**
 * Fades/slides content in when it enters the viewport. Honors prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  threshold = 0.12,
  rootMargin = "0px 0px -6% 0px",
  translateHiddenClass = "translate-y-8",
  durationClass = "duration-500",
  easeClass = "ease-[cubic-bezier(0.25,0.8,0.25,1)]",
  runwayPadding,
  hiddenSlideY,
  motionDurationMs = 500,
  motionEase = "cubic-bezier(0.25, 0.8, 0.25, 1)",
  runwayPaddingBottom,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** After reveal, drop will-change so layers aren’t promoted for the whole scroll session. */
  const [motionDone, setMotionDone] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          ob.unobserve(entry.target);
          /* Let the browser paint the hidden state once so opacity/transform transitions run */
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
          });
        }
      },
      { threshold, rootMargin }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduceMotion, threshold, rootMargin]);

  useEffect(() => {
    if (reduceMotion || !visible) return;
    const totalMs = motionDurationMs + delayMs;
    const id = window.setTimeout(() => setMotionDone(true), totalMs + 32);
    return () => clearTimeout(id);
  }, [reduceMotion, visible, motionDurationMs, delayMs]);

  useEffect(() => {
    if (reduceMotion || !visible || motionDone) return;
    const node = innerRef.current;
    if (!node) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
      setMotionDone(true);
    };
    node.addEventListener("transitionend", onEnd);
    return () => node.removeEventListener("transitionend", onEnd);
  }, [reduceMotion, visible, motionDone]);

  const useInlineMotion = Boolean(hiddenSlideY);

  const motionClasses = useInlineMotion
    ? "motion-reduce:transition-none"
    : reduceMotion
      ? `opacity-100 translate-y-0`
      : visible
        ? `opacity-100 translate-y-0`
        : `opacity-0 ${translateHiddenClass}`;

  const runwayActive = reduceMotion || visible;
  const outerRunwayTailwind = runwayPadding
    ? `${runwayActive ? runwayPadding.visible : runwayPadding.hidden} transition-[padding-bottom] ${durationClass} ${easeClass} motion-reduce:transition-none`
    : "";

  const transitionDelayCss = reduceMotion || !visible ? "0ms" : `${delayMs}ms`;
  const motionTransition = reduceMotion
    ? "none"
    : `opacity ${motionDurationMs}ms ${motionEase}, transform ${motionDurationMs}ms ${motionEase}`;
  const runwayTransition = reduceMotion
    ? "none"
    : `padding-bottom ${motionDurationMs}ms ${motionEase}`;

  const outerStyle: CSSProperties | undefined = runwayPaddingBottom
    ? {
        paddingBottom: runwayActive ? runwayPaddingBottom.visible : runwayPaddingBottom.hidden,
        transition: runwayTransition,
        transitionDelay: transitionDelayCss,
      }
    : runwayPadding
      ? { transitionDelay: transitionDelayCss }
      : undefined;

  const promoteWillChange = !reduceMotion && visible && !motionDone;

  const innerStyle: CSSProperties | undefined = useInlineMotion
    ? {
        opacity: reduceMotion || visible ? 1 : 0,
        transform: reduceMotion || visible ? "translateY(0)" : `translateY(${hiddenSlideY})`,
        transition: motionTransition,
        transitionDelay: transitionDelayCss,
        willChange: promoteWillChange ? "opacity, transform" : undefined,
      }
    : { transitionDelay: transitionDelayCss };

  /** Observed node stays untransformed; optional runway padding animates in sync with the slide. */
  return (
    <div
      ref={ref}
      className={`${className} ${runwayPaddingBottom ? "" : outerRunwayTailwind}`.trim()}
      style={outerStyle}
    >
      <div
        ref={innerRef}
        className={
          useInlineMotion
            ? `${motionClasses} motion-reduce:[transform:none] motion-reduce:opacity-100`.trim()
            : `${motionClasses} transition-[opacity,transform] ${durationClass} ${easeClass} ${
                promoteWillChange ? "will-change-[opacity,transform]" : ""
              } motion-reduce:transition-none`.trim()
        }
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  );
}
