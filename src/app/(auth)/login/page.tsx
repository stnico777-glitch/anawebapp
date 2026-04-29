"use client";

import { useState } from "react";
import Link from "next/link";
import { HERO_TAGLINE_AUTH_CLASS } from "@/constants/brandTypography";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await loginAction(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    /* Successful sign-in: `loginAction` uses `redirect()` to `/schedule` or `/subscribe`. */
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-sm bg-white p-8 shadow-md ring-1 ring-sand">
      <div className="text-center">
        <h1 className="text-2xl font-medium tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          awake + align
        </h1>
        <p className={HERO_TAGLINE_AUTH_CLASS}>power love sound mind</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-sm bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-sm border border-sand px-4 py-2 text-foreground placeholder-gray/60 focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-sm border border-sand px-4 py-2 text-foreground placeholder-gray/60 focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-sky-blue hover:text-sky-blue/80"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-sky-blue py-3 font-medium text-white transition-colors hover:bg-sky-blue/90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-gray">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-sky-blue hover:text-sky-blue/80">
          Sign up
        </Link>
      </p>
    </div>
  );
}
