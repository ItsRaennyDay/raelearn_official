"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();
const ALLOWED_ROLES = ["learner", "group_learner", "group_admin", "content_admin", "platform_admin"];

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

export async function updateUserRole(formData: FormData) {
  const actor = await verifyAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  if (!userId || !ALLOWED_ROLES.includes(role)) return;

  const db = createAdminClient();
  const { data: old } = await db.from("profiles").select("role").eq("id", userId).single();
  await db.from("profiles").upsert({ id: userId, role }, { onConflict: "id" });
  await logAction({ actorId: actor.id, action: "role_change", tableName: "profiles", recordId: userId, oldValues: old ?? undefined, newValues: { role } });
  revalidatePath(`/admin/users/${userId}`);
}

export async function addNote(formData: FormData) {
  const actor = await verifyAdmin();
  const userId = formData.get("userId") as string;
  const note = ((formData.get("note") as string) ?? "").trim().slice(0, 4000);
  if (!userId || !note) return;

  const db = createAdminClient();
  await db.from("user_notes").insert({ user_id: userId, author_id: actor.id, note });
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteNote(formData: FormData) {
  await verifyAdmin();
  const noteId = formData.get("noteId") as string;
  const userId = formData.get("userId") as string;
  if (!noteId) return;

  const db = createAdminClient();
  await db.from("user_notes").delete().eq("id", noteId);
  revalidatePath(`/admin/users/${userId}`);
}
