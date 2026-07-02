import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail, BASE_URL } from "@/lib/email/templates";

// Sends the welcome email the first time this user's address is confirmed.
// Never lets an email failure block the redirect that follows.
async function maybeSendWelcomeEmail(userId: string, email: string) {
  try {
    const db = createAdminClient();
    const { data: profile } = await db
      .from("profiles")
      .select("full_name, welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (!profile || profile.welcome_email_sent_at) return;

    const welcome = await renderEmail("welcome", {
      firstName: (profile.full_name || email).split(" ")[0],
      ctaUrl: `${BASE_URL}/courses`,
    });
    await sendEmail({ to: email, subject: welcome.subject, html: welcome.html, template: "welcome", recipientId: userId });
    await db.from("profiles").update({ welcome_email_sent_at: new Date().toISOString() }).eq("id", userId);
  } catch {
    // Never block auth on email failure.
  }
}

function safeRedirectPath(next: string | null): string {
  if (!next) return "/dashboard";
  // Must be a relative path — reject anything that starts with // or contains ://
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return "/dashboard";
  }
  // Block null-byte and other control characters
  if (/[\x00-\x1f]/.test(next)) return "/dashboard";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data.user;
      if (user?.id && user.email && user.email_confirmed_at) {
        await maybeSendWelcomeEmail(user.id, user.email);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}
