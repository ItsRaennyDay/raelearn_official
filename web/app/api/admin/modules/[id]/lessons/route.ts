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

  const { id: moduleId } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { title, lesson_type, sort_order } = body as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const safeType = ["text","video","quiz","assignment"].includes(String(lesson_type)) ? lesson_type : "text";

  const db = createAdminClient();
  const { data, error } = await db.from("lessons").insert({
    module_id:   moduleId,
    title:       title.trim().slice(0, 200),
    lesson_type: safeType,
    sort_order:  typeof sort_order === "number" ? sort_order : 0,
    status:      "draft",
    content:     { blocks: [] },
  }).select("id, title, lesson_type, duration_mins, sort_order, status").single();

  if (error) return NextResponse.json({ error: "Failed to create lesson." }, { status: 500 });
  return NextResponse.json(data);
}
