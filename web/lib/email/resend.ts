import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM_ADDRESS = "RaeLearn <noreply@mail.byraeform.com>";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
  template,
  recipientId,
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  recipientId?: string | null;
}) {
  const resend = getClient();
  if (!resend) {
    // No API key configured (e.g. local dev) — skip silently rather than crash the caller.
    return { ok: false as const };
  }

  // Sending email must never crash the calling flow (signup, enrollment, etc).
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    const db = createAdminClient();
    await db.from("email_logs").insert({
      recipient_id: recipientId ?? null,
      recipient_email: to,
      template,
      subject,
      status: error ? "failed" : "sent",
      provider_id: data?.id ?? null,
    });

    if (error) return { ok: false as const };
    return { ok: true as const, id: data?.id };
  } catch {
    return { ok: false as const };
  }
}
