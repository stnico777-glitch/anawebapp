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
function createPool(connectionString: string): Pool {
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
      "DATABASE_URL is required: add your Supabase Postgres URL in Vercel (or .env locally). For Vercel serverless, use the Supabase pooler (port 6543) with ?pgbouncer=true on the connection string.",
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
