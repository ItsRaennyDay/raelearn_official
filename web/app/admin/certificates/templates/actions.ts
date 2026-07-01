"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

export async function upsertTemplate(formData: FormData) {
  const actor = await verifyAdmin();
  const id = (formData.get("id") as string) || null;
  const name = ((formData.get("name") as string) ?? "").trim() || "Untitled Template";
  const settings = JSON.parse((formData.get("settings") as string) ?? "{}");

  const db = createAdminClient();

  if (id) {
    await db
      .from("certificate_templates")
      .update({ name, settings, updated_at: new Date().toISOString() })
      .eq("id", id);
    revalidatePath("/admin/certificates");
    redirect(`/admin/certificates/templates/${id}?saved=1`);
  } else {
    const { data } = await db
      .from("certificate_templates")
      .insert({ name, settings, created_by: actor.id })
      .select("id")
      .single();
    revalidatePath("/admin/certificates");
    redirect(`/admin/certificates/templates/${data!.id}?saved=1`);
  }
}

export async function deleteTemplate(formData: FormData) {
  await verifyAdmin();
  const id = formData.get("id") as string;
  const db = createAdminClient();
  // Unset from courses first
  await db.from("courses").update({ certificate_template_id: null }).eq("certificate_template_id", id);
  await db.from("certificate_templates").delete().eq("id", id);
  revalidatePath("/admin/certificates");
  redirect("/admin/certificates/templates");
}

export async function assignTemplateToCourse(formData: FormData) {
  await verifyAdmin();
  const courseId = formData.get("courseId") as string;
  const templateId = (formData.get("templateId") as string) || null;
  const db = createAdminClient();
  await db.from("courses").update({ certificate_template_id: templateId }).eq("id", courseId);
  revalidatePath("/admin/certificates");
  revalidatePath(`/admin/certificates/templates/${templateId}`);
}
