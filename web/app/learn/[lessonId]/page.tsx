import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonPlayer from "./LessonPlayer";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Fetch the lesson and its module/course info
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

  // Verify enrollment — learner must be actively enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .single();

  if (!enrollment) redirect(`/courses/${course.slug}`);

  // Fetch all published modules + lessons for the course (for sidebar + nav)
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      id, title, sort_order,
      lessons ( id, title, lesson_type, duration_mins, sort_order, status, module_id )
    `)
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

  // Build flat lesson list for prev/next navigation
  const allLessons = sortedModules.flatMap((m) => m.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Module position
  const moduleIndex = sortedModules.findIndex((m) => m.id === module_.id);
  const lessonIndex = sortedModules[moduleIndex]?.lessons.findIndex((l) => l.id === lessonId) ?? 0;

  // Fetch user progress for all lessons in this course
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  const completedLessonIds = (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id);
  const initialCompleted = completedLessonIds.includes(lessonId);

  // Fetch resources for this lesson
  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, resource_type, external_url, file_path")
    .eq("lesson_id", lessonId)
    .order("created_at");

  return (
    <LessonPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        lesson_type: lesson.lesson_type,
        content: lesson.content,
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
      resources={resources ?? []}
    />
  );
}
