"use client";

import Image from "next/image";
import { useState } from "react";
import { PRAYER_COVER_FALLBACK_SRC } from "@/lib/prayer-audio-covers";

/**
 * Prayer / rail cover art: remote URLs use `<img>`; local public paths use `next/image`.
 * On load error, swaps to a bundled fallback so the rail never shows a broken tile + title alt.
 */
export function CatalogCoverImage({
  src,
  unoptimized,
  className,
  sizes,
  priority,
  loading = "lazy",
}: {
  src: string;
  unoptimized: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  const [useFallback, setUseFallback] = useState(false);
  const srcFinal = useFallback ? PRAYER_COVER_FALLBACK_SRC : src;
  const unoptFinal = useFallback ? false : unoptimized;

  const onError = () => {
    if (!useFallback) setUseFallback(true);
  };

  if (unoptFinal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote library art
      <img
        src={srcFinal}
        alt=""
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        sizes={sizes}
        loading={priority ? "eager" : loading}
        decoding="async"
        onError={onError}
      />
    );
  }
  return (
    <Image
      src={srcFinal}
      alt=""
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading}
      onError={onError}
    />
  );
}
