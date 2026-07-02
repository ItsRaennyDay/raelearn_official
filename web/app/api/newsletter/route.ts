import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_SOURCES = new Set(["footer", "exit_intent", "group_waitlist"]);

// Rate limit: 5 subscribe attempts per IP per hour
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, source } = body as Record<string, unknown>;
  if (typeof email !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cleanName = typeof name === "string" ? name.trim().slice(0, 120) : "";
  const cleanEmail = email.trim().toLowerCase().slice(0, 254);
  const cleanSource = typeof source === "string" && ALLOWED_SOURCES.has(source) ? source : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({
    name: cleanName || null,
    email: cleanEmail,
    source: cleanSource,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
