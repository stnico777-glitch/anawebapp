"use client";

import DocumentVisibilityEffects from "@/components/DocumentVisibilityEffects";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocumentVisibilityEffects />
      {children}
    </>
  );
}
