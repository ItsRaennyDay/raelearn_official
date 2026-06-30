import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_LEARNER_TYPES = new Set(["va", "nonprofit", "founder", "business", "student", "other"]);
const ALLOWED_INTEREST_AREAS = new Set([
  "nonprofit_ops", "business_ops", "va_support", "website",
  "donor", "board", "startup", "sops", "automation", "grants",
]);

// Rate limit: 3 waitlist submissions per IP per hour
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
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

  const { firstName, email, learnerType, interestArea, source } = body as Record<string, unknown>;

  if (typeof firstName !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cleanFirst = firstName.trim().slice(0, 80);
  const cleanEmail = email.trim().toLowerCase().slice(0, 254);

  if (!cleanFirst) {
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const cleanLearnerType =
    typeof learnerType === "string" && ALLOWED_LEARNER_TYPES.has(learnerType.trim())
      ? learnerType.trim()
      : null;

  const cleanInterestArea =
    typeof interestArea === "string" && ALLOWED_INTEREST_AREAS.has(interestArea.trim())
      ? interestArea.trim()
      : null;

  const cleanSource =
    typeof source === "string" ? source.trim().slice(0, 120) : null;

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({
    first_name:    cleanFirst,
    email:         cleanEmail,
    learner_type:  cleanLearnerType,
    interest_area: cleanInterestArea,
    source:        cleanSource,
  });

  if (error) {
    if (error.code === "23505") {
      // Unique constraint on email_norm — already on the list
      return NextResponse.json({ alreadyJoined: true });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
