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

  const msg = error.message ?? "";
  const looksUnreachable =
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    /db\.[^ ]+\.supabase\.co/i.test(msg);

  const hint = looksUnreachable
    ? "Your server on Vercel cannot reach the database address in DATABASE_URL. If that address looks like db.something.supabase.co on port 5432, switch to Supabase’s Transaction pooler: Dashboard → Connect → Transaction pooler → copy the URI (port 6543), add your password, append &pgbouncer=true if missing. Paste that as DATABASE_URL in Vercel (Production + Preview), save, redeploy."
    : [
        "The CMS needs DATABASE_URL on Vercel pointing at Postgres. Prefer the Transaction pooler (port 6543, ?pgbouncer=true), not direct db.*.supabase.co:5432.",
        "If it still fails, open this deployment’s Logs and search for prisma or this digest.",
      ].join(" ");

  return (
    <div className="rounded-lg border border-sand bg-white p-8 shadow-[0_1px_2px_rgba(120,130,135,0.06)]">
      <h1
        className="text-xl font-semibold text-foreground [font-family:var(--font-headline),sans-serif]"
      >
        CMS could not load
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray md:text-base">{hint}</p>
      {error.message ? (
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
