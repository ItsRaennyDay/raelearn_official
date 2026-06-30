import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  return supabase;
}

export async function POST(request: NextRequest) {
  const supabase = await checkAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { title, slug, description, level, price_type, price_cents, certificate_eligible } = body as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug.trim())) return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only." }, { status: 400 });

  const { data, error } = await supabase.from("courses").insert({
    title:    title.trim().slice(0, 200),
    slug:     slug.trim().slice(0, 200),
    description: typeof description === "string" ? description.trim().slice(0, 2000) : null,
    level:    ["beginner","intermediate","advanced"].includes(String(level)) ? level : "beginner",
    price_type: ["free","paid"].includes(String(price_type)) ? price_type : "free",
    price_cents: Number(price_cents) >= 0 ? Number(price_cents) : 0,
    certificate_eligible: Boolean(certificate_eligible),
    status: "draft",
  }).select("id").single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A course with this slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create course." }, { status: 500 });
  }

  return NextResponse.json(data);
}
