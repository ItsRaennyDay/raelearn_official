import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Use request origin so this works in all environments
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(new URL("/", origin), { status: 302 });
}
