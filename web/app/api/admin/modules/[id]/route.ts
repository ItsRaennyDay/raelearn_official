import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() === ADMIN_EMAIL ? user : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const b = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.trim().slice(0, 200);
  if (typeof b.description === "string") patch.description = b.description.trim().slice(0, 1000);
  if (typeof b.sort_order === "number") patch.sort_order = b.sort_order;
  if (["draft","published","archived"].includes(String(b.status))) patch.status = b.status;

  const db = createAdminClient();
  const { error } = await db.from("modules").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update module." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const db = createAdminClient();
  const { error } = await db.from("modules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete module." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
