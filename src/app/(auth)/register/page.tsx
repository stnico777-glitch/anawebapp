"use client";

import { useState } from "react";
import Link from "next/link";
import { HERO_TAGLINE_AUTH_CLASS } from "@/constants/brandTypography";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = await registerAction(formData);
    setLoading(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    if (result && "needsEmailConfirmation" in result) {
      setInfo(result.message);
      return;
    }
    /* `registerAction` uses `redirect()` to `/subscribe` when a session exists. */
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-sm bg-white p-8 shadow-md ring-1 ring-sand">
      <div className="text-center">
        <h1 className="text-2xl font-medium tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          awake + align
        </h1>
        <p className={HERO_TAGLINE_AUTH_CLASS}>power love sound mind</p>
        <p className="mt-6 text-base font-medium tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          Create account
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {info && (
          <div className="rounded-sm border border-sky-blue/30 bg-sky-blue/5 p-3 text-sm text-foreground [font-family:var(--font-body),sans-serif]">
            {info}{" "}
            <Link href="/login" className="font-medium text-sky-blue hover:underline">
              Sign in
            </Link>{" "}
            after you confirm.
          </div>
        )}
        {error && (
          <div className="rounded-sm bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 block w-full rounded-sm border border-sand px-4 py-2 text-foreground placeholder-gray/60 focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
            placeholder="Your name"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-sm border border-sand px-4 py-2 text-foreground placeholder-gray/60 focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue"
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-sky-blue py-3 font-medium text-white transition-colors hover:bg-sky-blue/90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sky-blue hover:text-sky-blue/80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
