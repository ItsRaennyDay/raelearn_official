import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() === ADMIN_EMAIL ? user : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const db = createAdminClient();

  const { data: enrollments, error } = await db
    .from("enrollments")
    .select(`id, user_id, status, enrolled_at, source, profiles:user_id(full_name, email, role)`)
    .eq("course_id", id)
    .order("enrolled_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load enrollments." }, { status: 500 });

  const userIds = (enrollments ?? []).map((e) => e.user_id);
  const { data: progress } = userIds.length
    ? await db
        .from("lesson_progress")
        .select("user_id")
        .eq("course_id", id)
        .eq("completed", true)
        .in("user_id", userIds)
    : { data: [] };

  const completedByUser: Record<string, number> = {};
  for (const p of progress ?? []) {
    completedByUser[p.user_id] = (completedByUser[p.user_id] ?? 0) + 1;
  }

  const result = (enrollments ?? []).map((e) => {
    const profile = e.profiles as unknown as { full_name?: string; email?: string; role?: string } | null;
    return {
      id: e.id,
      user_id: e.user_id,
      status: e.status,
      enrolled_at: e.enrolled_at,
      source: e.source,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      role: profile?.role ?? "learner",
      completed_lessons: completedByUser[e.user_id] ?? 0,
    };
  });

  return NextResponse.json({ enrollments: result });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: profile } = await db.from("profiles").select("id").eq("email", email).single();
  if (!profile) return NextResponse.json({ error: "No registered user found with that email." }, { status: 404 });

  const { data: existing } = await db
    .from("enrollments").select("id").eq("user_id", profile.id).eq("course_id", id).eq("status", "active").single();
  if (existing) return NextResponse.json({ error: "This user is already enrolled in this course." }, { status: 409 });

  const { error: insertError } = await db.from("enrollments").insert({
    user_id: profile.id,
    course_id: id,
    status: "active",
    source: "admin",
    enrolled_at: new Date().toISOString(),
  });

  if (insertError) return NextResponse.json({ error: "Failed to create enrollment." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
