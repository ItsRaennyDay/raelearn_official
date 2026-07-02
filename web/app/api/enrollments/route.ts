import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail, BASE_URL } from "@/lib/email/templates";

// Self-service free enrollment. Paid courses must go through checkout, not this route.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const courseId = (body as Record<string, unknown>).courseId;
  if (typeof courseId !== "string" || !courseId) {
    return NextResponse.json({ error: "Course is required." }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: course } = await db
    .from("courses")
    .select("id, title, price_type")
    .eq("id", courseId)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.price_type !== "free") {
    return NextResponse.json({ error: "This course requires payment." }, { status: 400 });
  }

  const { error: insertError } = await db.from("enrollments").insert({
    user_id: user.id,
    course_id: courseId,
    source: "free",
    status: "active",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, alreadyEnrolled: true });
    }
    return NextResponse.json({ error: "Enrollment failed. Please try again." }, { status: 500 });
  }

  const { data: profile } = await db
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const recipientEmail = profile?.email || user.email;
  if (recipientEmail) {
    const email = await renderEmail("enrollment", {
      firstName: (profile?.full_name || recipientEmail).split(" ")[0],
      courseTitle: course.title,
      ctaUrl: `${BASE_URL}/dashboard`,
    });
    await sendEmail({
      to: recipientEmail,
      subject: email.subject,
      html: email.html,
      template: "enrollment",
      recipientId: user.id,
    });
  }

  return NextResponse.json({ ok: true });
}
