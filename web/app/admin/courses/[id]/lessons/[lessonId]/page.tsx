import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LessonEditor from "./LessonEditor";

interface Props { params: Promise<{ id: string; lessonId: string }> }

export default async function AdminLessonEditorPage({ params }: Props) {
  const { id: courseId, lessonId } = await params;
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const [{ data: course }, { data: module_ }, { data: assignment }] = await Promise.all([
    supabase.from("courses").select("id, title").eq("id", courseId).single(),
    supabase.from("modules").select("id, title").eq("id", lesson.module_id).single(),
    db.from("assignments").select("id, instructions, submission_type").eq("lesson_id", lessonId).maybeSingle(),
  ]);

  return (
    <LessonEditor
      lesson={lesson}
      courseId={courseId}
      courseTitle={course?.title ?? ""}
      moduleId={module_?.id ?? lesson.module_id}
      moduleTitle={module_?.title ?? ""}
      initialAssignment={assignment ?? null}
    />
  );
}
