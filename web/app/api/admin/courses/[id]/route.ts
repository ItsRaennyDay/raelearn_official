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
  if (typeof b.title === "string")       patch.title = b.title.trim().slice(0, 200);
  if (typeof b.slug === "string")        patch.slug  = b.slug.trim().slice(0, 200);
  if (typeof b.description === "string") patch.description = b.description.trim().slice(0, 2000);
  if (typeof b.legal_disclaimer === "string") patch.legal_disclaimer = b.legal_disclaimer.trim().slice(0, 2000);
  if (typeof b.thumbnail_url === "string")    patch.thumbnail_url = b.thumbnail_url.trim() || null;
  if (typeof b.preview_video_url === "string") patch.preview_video_url = b.preview_video_url.trim() || null;
  if (typeof b.category_id === "string") patch.category_id = b.category_id || null;
  if (["beginner","intermediate","advanced"].includes(String(b.level))) patch.level = b.level;
  if (["free","paid"].includes(String(b.price_type))) patch.price_type = b.price_type;
  if (["draft","published","archived"].includes(String(b.status))) patch.status = b.status;
  if (typeof b.price_cents === "number") patch.price_cents = Math.max(0, b.price_cents);
  if (typeof b.certificate_eligible === "boolean") patch.certificate_eligible = b.certificate_eligible;
  if (Array.isArray(b.outcomes))     patch.outcomes     = (b.outcomes as unknown[]).filter((o): o is string => typeof o === "string").slice(0, 30);
  if (Array.isArray(b.requirements)) patch.requirements = (b.requirements as unknown[]).filter((r): r is string => typeof r === "string").slice(0, 20);

  if (patch.slug && !/^[a-z0-9-]+$/.test(String(patch.slug))) {
    return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only." }, { status: 400 });
  }

  const { error } = await supabase.from("courses").update(patch).eq("id", id);

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A course with this slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update course." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete course." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
