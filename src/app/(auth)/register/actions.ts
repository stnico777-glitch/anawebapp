"use server";

import { redirect } from "next/navigation";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export type RegisterActionResult =
  | { error: string }
  | { needsEmailConfirmation: true; message: string };

export async function registerAction(formData: FormData): Promise<RegisterActionResult | void> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = ((formData.get("name") as string) || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured on this server." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const emailRedirectTo = site
    ? `${site.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/subscribe")}`
    : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, name },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { error: "An account with this email already exists" };
    }
    return { error: error.message };
  }

  /** Session is present when email confirmation is off (or user was already confirmed). */
  if (data.session) {
    redirect("/subscribe");
  }

  /** Some projects return no session on sign-up but allow immediate password sign-in. */
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (!signInError) {
    redirect("/subscribe");
  }

  return {
    needsEmailConfirmation: true,
    message:
      "We sent a confirmation email. Open the link to verify your address, then you’ll be signed in and can finish checkout on the next screen.",
  };
}
