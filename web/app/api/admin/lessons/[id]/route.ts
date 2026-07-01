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

  if (typeof b.title === "string")         patch.title = b.title.trim().slice(0, 200);
  if (typeof b.video_url === "string")     patch.video_url = b.video_url.trim() || null;
  if (b.video_url === null)                patch.video_url = null;
  if (typeof b.duration_mins === "number") patch.duration_mins = Math.max(0, Math.min(999, b.duration_mins));
  if (b.duration_mins === null)            patch.duration_mins = null;
  if (typeof b.is_required === "boolean")  patch.is_required = b.is_required;
  if (typeof b.sort_order === "number")    patch.sort_order = b.sort_order;
  if (["text","video","quiz","assignment"].includes(String(b.lesson_type))) patch.lesson_type = b.lesson_type;
  if (["draft","published"].includes(String(b.status))) patch.status = b.status;

  if (typeof b.content === "object" && b.content !== null) {
    const c = b.content as Record<string, unknown>;
    if (Array.isArray(c.blocks)) {
      if (c.blocks.length > 200) return NextResponse.json({ error: "Too many blocks." }, { status: 400 });
      patch.content = JSON.stringify({
        blocks: c.blocks.slice(0, 200),
        background: typeof c.background === "string" ? c.background : "warm",
      });
    }
  }

  patch.updated_at = new Date().toISOString();

  const db = createAdminClient();
  const { error } = await db.from("lessons").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update lesson." }, { status: 500 });

  // Sync assignment record when the lesson editor sends assignment-specific fields
  const assignmentInstructions = typeof b.assignment_instructions === "string" ? b.assignment_instructions.trim() : null;
  const courseId = typeof b.course_id === "string" ? b.course_id : null;

  if (assignmentInstructions !== null && courseId) {
    const submissionType = ["text", "file", "both"].includes(String(b.assignment_submission_type))
      ? (b.assignment_submission_type as string)
      : "text";
    const lessonTitle = typeof patch.title === "string" ? patch.title : null;
    let finalTitle = lessonTitle;
    if (!finalTitle) {
      const { data: existing } = await db.from("lessons").select("title").eq("id", id).single();
      finalTitle = existing?.title ?? "Assignment";
    }
    await db.from("assignments").upsert(
      {
        lesson_id: id,
        course_id: courseId,
        title: finalTitle,
        instructions: assignmentInstructions || "Complete the assignment.",
        submission_type: submissionType,
        status: typeof patch.status === "string" ? patch.status : "draft",
      },
      { onConflict: "lesson_id" }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const db = createAdminClient();
  const { error } = await db.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete lesson." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
