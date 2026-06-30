import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeRedirectPath(next: string | null): string {
  if (!next) return "/dashboard";
  // Must be a relative path — reject anything that starts with // or contains ://
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return "/dashboard";
  }
  // Block null-byte and other control characters
  if (/[\x00-\x1f]/.test(next)) return "/dashboard";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}
