import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  return supabase;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const b = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (typeof b.title === "string")      patch.title = b.title.trim().slice(0, 200);
  if (typeof b.video_url === "string")  patch.video_url = b.video_url.trim() || null;
  if (typeof b.duration_mins === "number") patch.duration_mins = Math.max(0, Math.min(999, b.duration_mins));
  if (typeof b.is_required === "boolean")  patch.is_required = b.is_required;
  if (typeof b.sort_order === "number")    patch.sort_order = b.sort_order;
  if (b.video_url === null)               patch.video_url = null;
  if (b.duration_mins === null)           patch.duration_mins = null;

  if (["text","video","quiz","assignment"].includes(String(b.lesson_type))) patch.lesson_type = b.lesson_type;
  if (["draft","published"].includes(String(b.status))) patch.status = b.status;

  // Validate and store content blocks
  if (typeof b.content === "object" && b.content !== null) {
    const c = b.content as Record<string, unknown>;
    if (Array.isArray(c.blocks)) {
      // Limit block count for safety
      if (c.blocks.length > 200) return NextResponse.json({ error: "Too many blocks." }, { status: 400 });
      patch.content = { blocks: c.blocks.slice(0, 200) };
    }
  }

  patch.updated_at = new Date().toISOString();

  const { error } = await supabase.from("lessons").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update lesson." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete lesson." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
