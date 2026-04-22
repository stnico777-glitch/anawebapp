import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

function formatTime(d: Date): string {
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const pageNum = Math.max(1, Number(pageParam ?? "1") || 1);

  const [total, rows] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      include: {
        user: {
          select: { displayName: true },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]">
          Feedback
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray md:text-base">
          Submissions from the More tab. Most recent first. Total: {total}.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-sand bg-white/60 p-8 text-center text-sm text-gray">
          No feedback yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const displayName =
              row.user?.displayName?.trim() ||
              row.name?.trim() ||
              (row.email ? row.email.trim() : null) ||
              (row.userId ? `Member ${row.userId.slice(0, 8)}` : "Anonymous");
            return (
              <li
                key={row.id}
                className="rounded-lg border border-sand bg-white p-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)] sm:p-5"
              >
                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                    {row.title}
                  </h2>
                  <time
                    className="text-xs text-gray"
                    dateTime={row.createdAt.toISOString()}
                  >
                    {formatTime(row.createdAt)}
                  </time>
                </header>
                <p className="mt-1 text-xs text-gray">
                  From{" "}
                  <span className="font-medium text-foreground">
                    {displayName}
                  </span>
                  {row.email ? (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        className="underline underline-offset-2 hover:text-sky-blue"
                        href={`mailto:${row.email}`}
                      >
                        {row.email}
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground [font-family:var(--font-body),sans-serif]">
                  {row.message}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-6 flex items-center justify-between text-sm"
          aria-label="Feedback pages"
        >
          {pageNum > 1 ? (
            <a
              href={`/admin/feedback?page=${pageNum - 1}`}
              className="rounded-md border border-sand bg-white px-3 py-1.5 font-medium text-foreground hover:bg-app-surface"
            >
              ← Newer
            </a>
          ) : (
            <span />
          )}
          <span className="text-gray tabular-nums">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages ? (
            <a
              href={`/admin/feedback?page=${pageNum + 1}`}
              className="rounded-md border border-sand bg-white px-3 py-1.5 font-medium text-foreground hover:bg-app-surface"
            >
              Older →
            </a>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
