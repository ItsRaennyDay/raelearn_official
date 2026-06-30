import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() === ADMIN_EMAIL ? user : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id: courseId } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { title, description, sort_order } = body as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const db = createAdminClient();
  const { data, error } = await db.from("modules").insert({
    course_id: courseId,
    title:     title.trim().slice(0, 200),
    description: typeof description === "string" ? description.trim().slice(0, 1000) : null,
    sort_order: typeof sort_order === "number" ? sort_order : 0,
    status: "published",
  }).select("id, title, description, sort_order, status").single();

  if (error) return NextResponse.json({ error: "Failed to create module." }, { status: 500 });
  return NextResponse.json(data);
}
