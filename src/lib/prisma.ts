import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

type RuntimeModelField = { name: string };

/** True when generated client predates current schema (e.g. missing `participantKey`). */
function modelHasScalarField(
  client: PrismaClient,
  modelName: string,
  fieldName: string,
): boolean {
  const models = (
    client as unknown as {
      _runtimeDataModel?: { models?: Record<string, { fields?: RuntimeModelField[] }> };
    }
  )._runtimeDataModel?.models;
  const fields = models?.[modelName]?.fields;
  return !!fields?.some((f) => f.name === fieldName);
}

/** True when client is missing community delegates (old generate) or is an orphaned instance. */
function isStalePrismaClient(client: PrismaClient): boolean {
  const c = client as unknown as {
    dailyVerse?: { findUnique?: unknown };
    prayerJournalEntry?: { findMany?: unknown };
    prayerRequestInteraction?: { groupBy?: unknown };
    praiseReportLike?: { groupBy?: unknown };
    prayerRequestComment?: { groupBy?: unknown };
    praiseReportComment?: { groupBy?: unknown };
  };
  if (
    typeof c.dailyVerse?.findUnique !== "function" ||
    typeof c.prayerJournalEntry?.findMany !== "function" ||
    typeof c.prayerRequestInteraction?.groupBy !== "function" ||
    typeof c.praiseReportLike?.groupBy !== "function" ||
    typeof c.prayerRequestComment?.groupBy !== "function" ||
    typeof c.praiseReportComment?.groupBy !== "function"
  ) {
    return true;
  }
  const hasRuntime =
    typeof (client as unknown as { _runtimeDataModel?: unknown })._runtimeDataModel ===
    "object";
  if (!hasRuntime) return false;
  if (!modelHasScalarField(client, "PrayerRequestInteraction", "participantKey")) {
    return true;
  }
  if (!modelHasScalarField(client, "PraiseReportLike", "participantKey")) {
    return true;
  }
  return false;
}

function resolveDbPath(url: string): string {
  const p = url.startsWith("file:") ? url.slice(5) : url;
  if (p.startsWith("/")) return p;
  const cwd = typeof process !== "undefined" ? process.cwd?.() ?? "" : "";
  return `${cwd}/${p.replace(/^\.\//, "")}`;
}

function useTursoLibsql(url: string): boolean {
  if (url.startsWith("libsql:")) return true;
  if (url.startsWith("https://") && process.env.DATABASE_AUTH_TOKEN?.trim())
    return true;
  return false;
}

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (useTursoLibsql(url)) {
    const token = process.env.DATABASE_AUTH_TOKEN?.trim();
    const adapter = new PrismaLibSql({
      url,
      authToken: token || undefined,
    });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }

  const dbPath = resolveDbPath(url);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/** Resolve the singleton client (prefer this over `prisma` proxy if a delegate looks undefined in your runtime). */
export function getPrisma(): PrismaClient {
  const g = globalForPrisma;
  if (g.prisma && isStalePrismaClient(g.prisma)) {
    void g.prisma.$disconnect().catch(() => {});
    g.prisma = undefined;
  }
  if (!g.prisma) {
    g.prisma = createPrisma();
  }
  return g.prisma;
}

/**
 * Lazy access: `export const prisma = getPrisma()` freezes the first instance forever
 * (Next.js can cache the module across `prisma generate`). Always resolve via getPrisma().
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    // Use `client` as receiver so Prisma’s model getters see the real PrismaClient as `this`.
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
