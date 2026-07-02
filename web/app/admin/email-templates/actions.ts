"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_TEMPLATES, type TemplateKey } from "@/lib/email/render";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

export async function saveTemplate(formData: FormData) {
  const actor = await verifyAdmin();
  const key = formData.get("key") as TemplateKey;
  if (!(key in DEFAULT_TEMPLATES)) throw new Error("Unknown template");

  const subject = ((formData.get("subject") as string) ?? "").trim();
  const bodyHtml = ((formData.get("bodyHtml") as string) ?? "").trim();
  if (!subject || !bodyHtml) redirect(`/admin/email-templates/${key}?error=missing-fields`);

  const db = createAdminClient();
  await db.from("email_templates").upsert({
    key,
    label: DEFAULT_TEMPLATES[key].label,
    subject,
    body_html: bodyHtml,
    updated_at: new Date().toISOString(),
    updated_by: actor.id,
  }, { onConflict: "key" });

  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${key}`);
  redirect(`/admin/email-templates/${key}?saved=1`);
}

export async function resetTemplate(formData: FormData) {
  await verifyAdmin();
  const key = formData.get("key") as TemplateKey;
  if (!(key in DEFAULT_TEMPLATES)) throw new Error("Unknown template");

  const db = createAdminClient();
  await db.from("email_templates").delete().eq("key", key);

  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${key}`);
  redirect(`/admin/email-templates/${key}?reset=1`);
}
