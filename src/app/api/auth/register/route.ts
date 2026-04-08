import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url?.trim() || !anon?.trim()) {
      return NextResponse.json(
        { error: "Authentication is not configured on this server." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const supabase = createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name ?? "", name: name ?? "" },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      return NextResponse.json(
        { error: (first && "message" in first ? first.message : null) ?? "Invalid input" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
