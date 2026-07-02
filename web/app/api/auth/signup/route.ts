import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

const ALLOWED_USER_TYPES = new Set([
  "va", "freelancer", "founder", "np_founder",
  "biz_owner", "team_member", "student", "other",
]);

const ALLOWED_INTERESTS = new Set([
  "nonprofit_ops", "business_ops", "va_support", "website",
  "donor", "board", "startup", "sops", "automation", "grants",
]);

// Simple in-process rate limit: max 5 signups per IP per 10 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
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
      { error: "Too many signup attempts. Please try again later." },
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

  const { name, email, password, userType, interests } = body as Record<string, unknown>;

  // Type checks
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Trim and length-limit
  const cleanName     = name.trim().slice(0, 120);
  const cleanEmail    = email.trim().toLowerCase().slice(0, 254);
  const cleanUserType = typeof userType === "string" ? userType.trim() : "other";

  if (!cleanName || !cleanEmail || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Password strength
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (password.length > 72) {
    return NextResponse.json({ error: "Password too long." }, { status: 400 });
  }

  // Allowlist userType
  const safeUserType = ALLOWED_USER_TYPES.has(cleanUserType) ? cleanUserType : "other";

  // Allowlist interests
  const safeInterests = Array.isArray(interests)
    ? (interests as unknown[])
        .filter((i): i is string => typeof i === "string" && ALLOWED_INTERESTS.has(i))
        .slice(0, 10)
    : [];

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name: cleanName, user_type: safeUserType, interests: safeInterests },
      emailRedirectTo: `${request.nextUrl.origin}/api/auth/callback`,
    },
  });

  if (error) {
    // Don't leak internal Supabase error details to the client
    const safeMsg =
      error.message.toLowerCase().includes("already registered")
        ? "An account with this email already exists."
        : "Signup failed. Please check your details and try again.";
    return NextResponse.json({ error: safeMsg }, { status: 400 });
  }

  const welcome = welcomeEmail(cleanName);
  await sendEmail({
    to: cleanEmail,
    subject: welcome.subject,
    html: welcome.html,
    template: "welcome",
  });

  return NextResponse.json({ ok: true });
}
