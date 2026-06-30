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
