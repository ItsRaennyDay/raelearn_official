import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  return supabase;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id: moduleId } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { title, lesson_type, sort_order } = body as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const safeType = ["text","video","quiz","assignment"].includes(String(lesson_type)) ? lesson_type : "text";

  const { data, error } = await supabase.from("lessons").insert({
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
