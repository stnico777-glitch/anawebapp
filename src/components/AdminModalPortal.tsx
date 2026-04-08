"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders modal UI on `document.body` so `position: fixed` is always viewport-centered.
 * Without this, overlays inside horizontally scrolled or transformed rails (e.g. hover lift)
 * appear offset or “flash” between row center and screen center.
 */
export default function AdminModalPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
