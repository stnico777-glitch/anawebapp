"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  const isDbHint =
    error.message?.includes("DATABASE_URL") ||
    error.message?.toLowerCase().includes("postgres");
  const hint = [
    "On new deployments, the CMS usually fails if DATABASE_URL is missing on Vercel. Add your Supabase Postgres connection string under Project → Settings → Environment Variables (set it for Preview and Production). For serverless, use the Supabase pooler URL (port 6543) and include ?pgbouncer=true.",
    isDbHint
      ? null
      : "If DATABASE_URL is already set, open this deployment’s Logs in Vercel and search for this digest or “prisma” / “admin”.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="rounded-lg border border-sand bg-white p-8 shadow-[0_1px_2px_rgba(120,130,135,0.06)]">
      <h1
        className="text-xl font-semibold text-foreground [font-family:var(--font-headline),sans-serif]"
      >
        CMS could not load
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray md:text-base">{hint}</p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-sm bg-app-surface p-3 text-xs text-foreground">
          {error.message}
        </pre>
      ) : null}
      {error.digest ? (
        <p className="mt-4 text-xs text-gray">Digest: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm bg-sky-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/schedule"
          className="inline-flex items-center rounded-sm border border-sand px-4 py-2 text-sm font-medium text-foreground transition hover:bg-app-surface"
        >
          Back to app
        </Link>
      </div>
    </div>
  );
}
