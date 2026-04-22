import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  title: z.string().min(1).max(140),
  message: z.string().min(1).max(4000),
  /** Only respected when the submitter is not logged in (so a reply path exists). */
  email: z.string().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});

/** Web3Forms access key — delivers submissions to the inbox registered with this key.
 *  Must be supplied via `WEB3FORMS_ACCESS_KEY` in env. When missing we still persist
 *  the row in Postgres so no feedback is lost; the email forward just no-ops. */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/** Fires the email side-effect asynchronously — failures don't block the UX.
 *  Web3Forms is a hosted forwarding service; one access key = one destination
 *  inbox. Free tier has no domain lock-in and no SMTP config required. */
async function tryEmailFeedback(entry: {
  title: string;
  message: string;
  email: string | null;
  name: string | null;
  userId: string | null;
  id: string;
}): Promise<void> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    console.warn(
      "[feedback] WEB3FORMS_ACCESS_KEY not set — feedback stored in DB but email forward skipped.",
    );
    return;
  }

  const replyLabel =
    entry.email || entry.name || (entry.userId ? `User ${entry.userId}` : "anonymous");
  const bodyLines = [
    `Title: ${entry.title}`,
    "",
    "Message:",
    entry.message,
    "",
    `From: ${replyLabel}`,
    entry.userId ? `User id: ${entry.userId}` : null,
    `Entry id: ${entry.id}`,
  ].filter((l): l is string => l !== null);

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `[awake + align] Feedback: ${entry.title.slice(0, 100)}`,
        from_name: entry.name || replyLabel,
        replyto: entry.email ?? undefined,
        message: bodyLines.join("\n"),
        /** Web3Forms's anti-spam ping; left blank so it never trips on real users. */
        botcheck: "",
      }),
    });
    if (!res.ok) {
      console.error("[feedback] web3forms non-ok:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[feedback] web3forms request failed:", err);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const sessionName = session?.user?.name?.trim() || null;

  /** Rate limit — 5 submissions per hour per actor. Generous enough for honest users,
   *  tight enough to dampen abuse. Keyed by user id if logged in, else by IP. */
  const actor = userId ? `user:${userId}` : `ip:${clientIp(request)}`;
  const gate = rateLimit(`feedback:${actor}`, 5, 60 * 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "You've sent a lot of feedback recently — please try again later." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const title = parsed.data.title.trim();
  const message = parsed.data.message.trim();
  const email = userId ? null : parsed.data.email ?? null;

  try {
    const entry = await prisma.feedback.create({
      data: {
        userId,
        email,
        name: sessionName,
        title,
        message,
      },
      select: { id: true },
    });

    // Fire email (if configured) — don't block the response.
    void tryEmailFeedback({
      id: entry.id,
      title,
      message,
      email,
      name: sessionName,
      userId,
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error("[feedback] create failed:", err);
    return NextResponse.json(
      { error: "Couldn't save your feedback right now. Please try again." },
      { status: 500 },
    );
  }
}
