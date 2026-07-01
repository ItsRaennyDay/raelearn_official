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

export async function createQuiz(formData: FormData) {
  await verifyAdmin();
  const title         = (formData.get("title") as string ?? "").trim();
  const course_id     = (formData.get("course_id") as string) || null;
  const lesson_id     = (formData.get("lesson_id") as string) || null;
  const passing_score = Math.min(100, Math.max(0, parseInt(formData.get("passing_score") as string) || 70));
  const max_raw       = formData.get("max_attempts") as string;
  const max_attempts  = max_raw ? parseInt(max_raw) : null;

  if (!title) redirect("/admin/quizzes/new?error=missing-title");

  const db = createAdminClient();
  const { data } = await db
    .from("quizzes")
    .insert({ title, course_id, lesson_id, passing_score, max_attempts, status: "draft" })
    .select("id")
    .single();

  redirect(`/admin/quizzes/${data?.id}`);
}

export async function updateQuizMeta(formData: FormData) {
  await verifyAdmin();
  const id            = formData.get("id") as string;
  const title         = (formData.get("title") as string ?? "").trim();
  const passing_score = Math.min(100, Math.max(0, parseInt(formData.get("passing_score") as string) || 70));
  const max_raw       = formData.get("max_attempts") as string;
  const max_attempts  = max_raw ? parseInt(max_raw) : null;
  const status        = formData.get("status") as string;

  if (!id || !title) return;
  const db = createAdminClient();
  await db.from("quizzes").update({ title, passing_score, max_attempts, status }).eq("id", id);
  revalidatePath(`/admin/quizzes/${id}`);
  redirect(`/admin/quizzes/${id}?saved=1`);
}

export async function upsertQuestion(q: {
  id?: string | null;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_index: number;
  sort_order: number;
}) {
  await verifyAdmin();
  const db = createAdminClient();
  const payload = {
    quiz_id:        q.quiz_id,
    question_text:  q.question_text.trim(),
    question_type:  q.question_type,
    options:        q.options,
    correct_answer: { index: q.correct_index },
    sort_order:     q.sort_order,
  };
  if (q.id) {
    await db.from("quiz_questions").update(payload).eq("id", q.id);
  } else {
    await db.from("quiz_questions").insert(payload);
  }
  revalidatePath(`/admin/quizzes/${q.quiz_id}`);
}

export async function deleteQuestion(questionId: string, quizId: string) {
  await verifyAdmin();
  const db = createAdminClient();
  await db.from("quiz_questions").delete().eq("id", questionId);
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function moveQuestion(questionId: string, quizId: string, direction: "up" | "down") {
  await verifyAdmin();
  const db = createAdminClient();
  const { data: questions } = await db
    .from("quiz_questions")
    .select("id, sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (!questions) return;
  const idx     = questions.findIndex((q) => q.id === questionId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= questions.length) return;

  const cur  = questions[idx];
  const swap = questions[swapIdx];
  await db.from("quiz_questions").update({ sort_order: swap.sort_order }).eq("id", cur.id);
  await db.from("quiz_questions").update({ sort_order: cur.sort_order  }).eq("id", swap.id);
  revalidatePath(`/admin/quizzes/${quizId}`);
}
