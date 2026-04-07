import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dns from "node:dns";
import { Pool, type PoolConfig } from "pg";

/** Vercel → Supabase often resolves `db.*.supabase.co` to IPv6 first; Node can then fail with ENETUNREACH. Prefer IPv4. */
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

/**
 * Supabase Postgres is always reached over TLS. On Vercel, `pg` often needs explicit
 * `ssl` or connections fail at runtime (generic Next.js digest; local dev may still work).
 * Serverless: keep pool tiny (one connection per lambda is enough for Prisma here).
 */
/**
 * Direct `db.<ref>.supabase.co:5432` often fails from Vercel (P1001). Use the Transaction
 * pooler from Supabase Connect (port 6543, `?pgbouncer=true`). See admin error UI + logs.
 */
function warnIfDirectSupabaseOnVercel(connectionString: string) {
  if (process.env.VERCEL !== "1") return;
  if (
    /db\.[^.]+\.supabase\.co/i.test(connectionString) &&
    /:5432\b/.test(connectionString)
  ) {
    console.error(
      "[prisma] DATABASE_URL uses Supabase direct DB (db.*.supabase.co:5432). Vercel often cannot reach it — switch to the Transaction pooler URL (port 6543, add ?pgbouncer=true) in Vercel → Environment Variables, then redeploy.",
    );
  }
}

function createPool(connectionString: string): Pool {
  warnIfDirectSupabaseOnVercel(connectionString);
  const isSupabase = /supabase\.co|pooler\.supabase\.com/i.test(connectionString);
  const config: PoolConfig = {
    connectionString,
    max: process.env.VERCEL ? 1 : 10,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
  };
  if (isSupabase) {
    config.ssl = { rejectUnauthorized: false };
  }
  return new Pool(config);
}

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString?.trim()) {
    throw new Error(
      "DATABASE_URL is required. On Vercel, use Supabase’s Transaction pooler connection string (Connect → Transaction pooler, port 6543, include ?pgbouncer=true), not the direct db.*.supabase.co:5432 URL.",
    );
  }
  const pool = globalForPrisma.pool ?? createPool(connectionString);
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
