"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

export async function gradeSubmission(formData: FormData) {
  const user = await verifyAdmin();
  const submissionId  = formData.get("submissionId") as string;
  const assignmentId  = formData.get("assignmentId") as string;
  const status        = formData.get("status") as string;
  const reviewerNote  = (formData.get("reviewerNote") as string).trim();

  const db = createAdminClient();
  await db
    .from("assignment_submissions")
    .update({
      status,
      reviewer_note: reviewerNote || null,
      reviewer_id:   user.id,
      reviewed_at:   new Date().toISOString(),
    })
    .eq("id", submissionId);

  revalidatePath(`/admin/assignments/${assignmentId}`);
  revalidatePath(`/admin/assignments/${assignmentId}/submissions/${submissionId}`);
}
