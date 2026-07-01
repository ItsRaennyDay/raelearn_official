"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const current = formData.get("current") as string;
  const next = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!next || next.length < 8) redirect("/dashboard/settings?pwError=too-short");
  if (next !== confirm) redirect("/dashboard/settings?pwError=mismatch");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current,
  });
  if (signInError) redirect("/dashboard/settings?pwError=wrong-current");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) redirect("/dashboard/settings?pwError=failed");

  redirect("/dashboard/settings?pwSaved=1");
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const preferences = {
    email_enrollment: formData.get("email_enrollment") === "on",
    email_updates: formData.get("email_updates") === "on",
    email_support: formData.get("email_support") === "on",
  };

  await supabase.from("profiles").update({ preferences }).eq("id", user.id);
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?prefsSaved=1");
}
