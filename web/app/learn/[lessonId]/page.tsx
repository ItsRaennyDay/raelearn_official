import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LessonPlayer from "./LessonPlayer";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

interface RawBlock { type: string; [key: string]: unknown }

function parseContent(raw: unknown): { blocks: RawBlock[]; background: string } {
  if (!raw) return { blocks: [], background: "warm" };
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).blocks)) {
      const p = parsed as { blocks: RawBlock[]; background?: string };
      return { blocks: p.blocks, background: p.background ?? "warm" };
    }
  } catch { /* fall through */ }
  return { blocks: [], background: "warm" };
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      id, title, lesson_type, content, video_url, duration_mins, sort_order, module_id, status,
      modules!inner (
        id, title, sort_order, course_id,
        courses!inner ( id, title, slug, status )
      )
    `)
    .eq("id", lessonId)
    .single();

  if (!lesson || lesson.status !== "published") notFound();

  const module_ = lesson.modules as unknown as {
    id: string; title: string; sort_order: number; course_id: string;
    courses: { id: string; title: string; slug: string; status: string };
  };
  const course = module_.courses;

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .single();

  if (!enrollment) redirect(`/courses/${course.slug}`);

  // Fetch all published modules + lessons for sidebar
  const { data: modules } = await supabase
    .from("modules")
    .select(`id, title, sort_order, lessons ( id, title, lesson_type, duration_mins, sort_order, status, module_id )`)
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order")
    .returns<{
      id: string; title: string; sort_order: number;
      lessons: { id: string; title: string; lesson_type: string; duration_mins: number | null; sort_order: number; status: string; module_id: string }[];
    }[]>();

  const sortedModules = (modules ?? []).map((m) => ({
    ...m,
    lessons: m.lessons.filter((l) => l.status === "published").sort((a, b) => a.sort_order - b.sort_order),
  })).sort((a, b) => a.sort_order - b.sort_order);

  const allLessons = sortedModules.flatMap((m) => m.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const moduleIndex = sortedModules.findIndex((m) => m.id === module_.id);
  const lessonIndex = sortedModules[moduleIndex]?.lessons.findIndex((l) => l.id === lessonId) ?? 0;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  const completedLessonIds = (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id);
  const initialCompleted = completedLessonIds.includes(lessonId);

  // Fetch quiz attached to this lesson (required quiz from Quiz Builder)
  const adminDb = createAdminClient();
  const { data: lessonQuiz } = await adminDb
    .from("quizzes")
    .select("id, title, passing_score, max_attempts")
    .eq("lesson_id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  type QuizQuestion = {
    id: string; question_text: string; question_type: string;
    options: string[] | null; correct_answer: { index: number } | null; sort_order: number;
  };
  type QuizData = {
    id: string; title: string; passing_score: number;
    max_attempts: number | null; questions: QuizQuestion[];
  };

  let quiz: QuizData | null = null;
  let initialQuizPassed = false;

  if (lessonQuiz) {
    const [{ data: rawQuestions }, { data: passedAttempt }] = await Promise.all([
      adminDb
        .from("quiz_questions")
        .select("id, question_text, question_type, options, correct_answer, sort_order")
        .eq("quiz_id", lessonQuiz.id)
        .order("sort_order"),
      supabase
        .from("quiz_attempts")
        .select("id")
        .eq("quiz_id", lessonQuiz.id)
        .eq("user_id", user.id)
        .eq("status", "passed")
        .limit(1),
    ]);
    initialQuizPassed = (passedAttempt?.length ?? 0) > 0;
    quiz = {
      id: lessonQuiz.id,
      title: lessonQuiz.title,
      passing_score: lessonQuiz.passing_score,
      max_attempts: lessonQuiz.max_attempts,
      questions: (rawQuestions ?? []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options as string[] | null,
        correct_answer: q.correct_answer as { index: number } | null,
        sort_order: q.sort_order,
      })),
    };
  }

  // Parse content blocks — separate resource+checklist blocks for the right panel
  const { blocks: allBlocks, background } = parseContent(lesson.content);
  const resourceBlocks = allBlocks.filter((b) => b.type === "resource") as Array<{
    type: "resource"; title: string; url: string; description?: string; fileType: string;
  }>;
  const checklistItems: string[] = allBlocks
    .filter((b) => b.type === "checklist")
    .flatMap((b) => {
      const items = (b as { items?: { text: string }[] }).items ?? [];
      return items.map((i) => i.text).filter(Boolean);
    });
  // Content blocks = everything except resource blocks (checklist blocks remain in content too for now)
  const contentBlocks = allBlocks.filter((b) => b.type !== "resource");

  return (
    <LessonPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        lesson_type: lesson.lesson_type,
        video_url: lesson.video_url,
        duration_mins: lesson.duration_mins,
        sort_order: lesson.sort_order,
        module_id: lesson.module_id,
      }}
      course={course}
      modules={sortedModules}
      initialCompleted={initialCompleted}
      prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      moduleTitle={module_.title}
      moduleIndex={moduleIndex}
      lessonIndex={lessonIndex}
      totalLessons={sortedModules[moduleIndex]?.lessons.length ?? 1}
      completedLessonIds={completedLessonIds}
      contentBlocks={contentBlocks}
      resourceBlocks={resourceBlocks}
      checklistItems={checklistItems}
      background={background}
      quiz={quiz}
      initialQuizPassed={initialQuizPassed}
    />
  );
}
