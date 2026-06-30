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

  // 1. Fetch enrollments (no join)
  const { data: enrollments, error: enrollErr } = await db
    .from("enrollments")
    .select("id, user_id, status, enrolled_at, source")
    .eq("course_id", id)
    .order("enrolled_at", { ascending: false });

  if (enrollErr) {
    return NextResponse.json({ error: enrollErr.message }, { status: 500 });
  }

  const userIds = (enrollments ?? []).map((e) => e.user_id);

  // 2. Fetch profiles separately
  const { data: profiles } = userIds.length
    ? await db.from("profiles").select("id, full_name, email, role").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // 3. Get auth data for any profiles missing email or full_name
  const missingDataIds = userIds.filter(
    (uid) => !profileMap.get(uid)?.email || !profileMap.get(uid)?.full_name
  );
  type AuthData = { email: string; full_name: string };
  let authDataMap: Map<string, AuthData> = new Map();
  if (missingDataIds.length > 0) {
    const results = await Promise.all(
      missingDataIds.map((uid) =>
        db.auth.admin.getUserById(uid).then((r) => [uid, {
          email: r.data.user?.email ?? "",
          full_name: r.data.user?.user_metadata?.full_name ?? r.data.user?.user_metadata?.name ?? "",
        }] as [string, AuthData])
      )
    );
    authDataMap = new Map(results);
  }

  // 4. Count completed lessons per user for this course
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

  // 5. Merge
  const result = (enrollments ?? []).map((e) => {
    const profile = profileMap.get(e.user_id);
    const auth = authDataMap.get(e.user_id);
    return {
      id: e.id,
      user_id: e.user_id,
      status: e.status,
      enrolled_at: e.enrolled_at,
      source: e.source,
      full_name: profile?.full_name || auth?.full_name || null,
      email: profile?.email || auth?.email || null,
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

  // Look up user by email — check profiles first, then auth
  let userId: string | null = null;

  const { data: profileByEmail } = await db.from("profiles").select("id").eq("email", email).single();
  if (profileByEmail) {
    userId = profileByEmail.id;
  } else {
    // Fall back to auth.admin.listUsers and search by email
    const listResult = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listResult.error) {
      return NextResponse.json({ error: `Auth lookup failed: ${listResult.error.message}` }, { status: 500 });
    }
    const authUser = (listResult.data?.users ?? []).find((u) => u.email?.toLowerCase() === email);
    userId = authUser?.id ?? null;
  }

  if (!userId) return NextResponse.json({ error: `No registered user found with email: ${email}` }, { status: 404 });

  const { data: existing } = await db
    .from("enrollments").select("id").eq("user_id", userId).eq("course_id", id).eq("status", "active").single();
  if (existing) return NextResponse.json({ error: "This user is already enrolled in this course." }, { status: 409 });

  const { error: insertError } = await db.from("enrollments").insert({
    user_id: userId,
    course_id: id,
    status: "active",
    source: "admin_grant",
    enrolled_at: new Date().toISOString(),
  });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
