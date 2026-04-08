"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  /** Placeholder while not yet intersecting (keep height to reduce layout shift). */
  fallback: ReactNode;
  rootMargin?: string;
};

/**
 * Mounts `children` only after the sentinel intersects the viewport (cheap until scroll).
 */
export default function LazyWhenVisible({
  children,
  fallback,
  rootMargin = "120px 0px",
}: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className="w-full">
      {show ? children : fallback}
    </div>
  );
}
