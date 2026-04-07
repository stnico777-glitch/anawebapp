import { NextResponse } from "next/server";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Email confirmation / OAuth redirect target (configure the same URL in Supabase Auth settings).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/schedule";

  if (code) {
    const supabase = await tryCreateSupabaseServerClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${next}`}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
