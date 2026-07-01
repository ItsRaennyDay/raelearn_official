"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markLessonComplete(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Verify enrollment before updating progress
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .single();

  if (!enrollment) return { error: "Not enrolled" };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  return error ? { error: error.message } : { ok: true };
}

export async function submitQuizAttempt(
  quizId: string,
  userAnswers: Record<string, number>,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" } as const;

  const [{ data: quiz }, { data: questions }, { count: attemptCount }] = await Promise.all([
    supabase.from("quizzes").select("id, passing_score, max_attempts").eq("id", quizId).single(),
    supabase.from("quiz_questions").select("id, correct_answer").eq("quiz_id", quizId),
    supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("quiz_id", quizId).eq("user_id", user.id),
  ]);

  if (!quiz) return { error: "Quiz not found" } as const;
  if (quiz.max_attempts && (attemptCount ?? 0) >= quiz.max_attempts) {
    return { error: "No attempts remaining" } as const;
  }
  if (!questions?.length) return { error: "No questions" } as const;

  let correct = 0;
  for (const q of questions) {
    const correctIdx = (q.correct_answer as { index: number } | null)?.index;
    if (correctIdx !== undefined && userAnswers[q.id] === correctIdx) correct++;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= quiz.passing_score;

  await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    user_id: user.id,
    answers: userAnswers,
    score,
    status: passed ? "passed" : "failed",
  });

  return { score, passed, passing_score: quiz.passing_score };
}

export async function saveVideoProgress(
  lessonId: string,
  courseId: string,
  lastPositionSeconds: number,
  timeSpentSeconds: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .single();

  if (!enrollment) return { error: "Not enrolled" };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      last_position_seconds: Math.max(0, Math.floor(lastPositionSeconds)),
      time_spent_seconds: Math.max(0, Math.floor(timeSpentSeconds)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id", ignoreDuplicates: false }
  );

  return error ? { error: error.message } : { ok: true };
}
