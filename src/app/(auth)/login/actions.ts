"use server";

import { redirect } from "next/navigation";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) {
    return { error: "Authentication is not configured on this server." };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Invalid email or password" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "Could not complete sign-in" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscriber, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const paid = profile?.is_subscriber ?? false;
  const admin = profile?.is_admin ?? false;

  if (paid || admin) {
    redirect("/schedule");
  }
  redirect("/subscribe");
}
