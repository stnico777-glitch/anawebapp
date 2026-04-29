/**
 * Push local env to Vercel (production + preview).
 * Loads `.env` then `.env.local` (override) so secrets like `DATABASE_URL` can live in `.env.local` only.
 * Run: node scripts/sync-vercel-env.mjs
 */
import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptDir, "..");
process.chdir(root);

dotenv.config({ path: path.join(root, ".env") });
const localPath = path.join(root, ".env.local");
if (fs.existsSync(localPath)) {
  dotenv.config({ path: localPath, override: true });
}

/** Default if .env still has localhost — change in Vercel or set VERCEL_PRODUCTION_SITE_URL in .env */
const DEFAULT_PRODUCTION_SITE_URL = "https://anawebapp.vercel.app";

function resolveSiteUrl(target) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !/localhost|127\.0\.0\.1/i.test(fromEnv)) {
    return fromEnv.replace(/\/$/, "");
  }
  const preview = process.env.VERCEL_PREVIEW_SITE_URL?.trim();
  if (target === "preview" && preview) return preview.replace(/\/$/, "");
  const prod = process.env.VERCEL_PRODUCTION_SITE_URL?.trim();
  return (prod || DEFAULT_PRODUCTION_SITE_URL).replace(/\/$/, "");
}

function vercelEnvAdd(name, target, value, { sensitive = false } = {}) {
  /** Vercel CLI 50+ Preview: pass empty string as git-branch = all preview branches (non-interactive). */
  const vercelArgs = ["env", "add", name, target];
  if (target === "preview") vercelArgs.push("");
  if (sensitive) vercelArgs.push("--sensitive");
  vercelArgs.push("--value", value, "--force", "--yes", "--non-interactive");
  const vercelBin = path.join(root, "node_modules", ".bin", "vercel");
  const r = fs.existsSync(vercelBin)
    ? spawnSync(vercelBin, vercelArgs, { stdio: "inherit", shell: false })
    : spawnSync("npx", ["vercel", ...vercelArgs], { stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const targets = ["production", "preview"];

const fromEnv = [
  ["NEXT_PUBLIC_SUPABASE_URL", false],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", false],
  ["DATABASE_URL", true],
  ["SUPABASE_SERVICE_ROLE_KEY", true],
];

/** Optional — only pushed when present in `.env` (same names as `src/lib/stripe-price-env.ts`). */
const optionalStripe = [
  ["STRIPE_SECRET_KEY", true],
  ["STRIPE_WEBHOOK_SECRET", true],
  ["STRIPE_PRICE_ID_MONTHLY", false],
  ["STRIPE_PRICE_ID_YEARLY", false],
];

for (const target of targets) {
  for (const [name, sensitive] of fromEnv) {
    const v = process.env[name]?.trim();
    if (!v) {
      console.error(`Missing ${name} in .env / .env.local`);
      process.exit(1);
    }
    console.error(`→ ${name} (${target})`);
    vercelEnvAdd(name, target, v, { sensitive });
  }
  const siteUrl = resolveSiteUrl(target);
  console.error(`→ NEXT_PUBLIC_SITE_URL (${target}) = ${siteUrl}`);
  vercelEnvAdd("NEXT_PUBLIC_SITE_URL", target, siteUrl, { sensitive: false });

  for (const [name, sensitive] of optionalStripe) {
    const v = process.env[name]?.trim();
    if (!v) continue;
    console.error(`→ ${name} (${target})`);
    vercelEnvAdd(name, target, v, { sensitive });
  }
}

const ig = process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_REF?.trim();
if (ig) {
  for (const target of targets) {
    console.error(`→ NEXT_PUBLIC_INSTAGRAM_EMBED_REF (${target})`);
    vercelEnvAdd("NEXT_PUBLIC_INSTAGRAM_EMBED_REF", target, ig, { sensitive: false });
  }
}

console.error("Done. Trigger a redeploy so the new env + buildCommand apply.");
