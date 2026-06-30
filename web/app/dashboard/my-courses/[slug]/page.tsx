import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MyCourseOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, description, outcomes, level, certificate_eligible, thumbnail_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) notFound();

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, status, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  if (!enrollment || enrollment.status === "cancelled") redirect(`/courses/${slug}`);

  // Fetch modules + lessons
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      id, title, description, sort_order,
      lessons ( id, title, lesson_type, duration_mins, sort_order, status )
    `)
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order")
    .returns<{
      id: string; title: string; description: string | null; sort_order: number;
      lessons: { id: string; title: string; lesson_type: string; duration_mins: number | null; sort_order: number; status: string }[];
    }[]>();

  const sortedModules = (modules ?? []).map((m) => ({
    ...m,
    lessons: m.lessons.filter((l) => l.status === "published").sort((a, b) => a.sort_order - b.sort_order),
  })).sort((a, b) => a.sort_order - b.sort_order);

  const allLessons = sortedModules.flatMap((m) => m.lessons);

  // Fetch progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const completedCount = completedIds.size;
  const totalCount = allLessons.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find first incomplete lesson (or first lesson if none done)
  const nextLesson =
    allLessons.find((l) => !completedIds.has(l.id)) ??
    allLessons[0];

  const levelColor = course.level === "beginner" ? "#22c55e" : course.level === "intermediate" ? "#f59e0b" : "#ef4444";

  const LESSON_TYPE_ICON: Record<string, React.ReactNode> = {
    video: (
      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="3,2 11,7 3,12" /></svg>
    ),
    text: (
      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h6" /></svg>
    ),
    quiz: (
      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M7 9V7M7 5h.01" /></svg>
    ),
    assignment: (
      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2H5L4 4H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-1L9 2Z" /></svg>
    ),
  };

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "#9AB89E" }}>
        <Link href="/dashboard/my-courses" style={{ color: "#4A7A4E" }} className="hover:underline">My Courses</Link>
        <span>›</span>
        <span style={{ color: "#1A2E1C", fontWeight: 600 }}>{course.title}</span>
      </nav>

      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#2A5230 0%,#1A2E1C 100%)" }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}>
              {course.level}
            </span>
            {course.certificate_eligible && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(255,215,0,0.2)", color: "#FFD700" }}>
                Certificate
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold mb-3 text-white" style={{ fontFamily: "var(--font-head)" }}>
            {course.title}
          </h1>
          {course.description && (
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "520px" }}>{course.description}</p>
          )}
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{completedCount} of {totalCount} lessons complete</span>
              <span className="text-xs font-bold" style={{ color: "#A8D5B0" }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#4ADE80,#22c55e)" }} />
            </div>
          </div>
          {nextLesson && (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
              style={{ background: "#fff", color: "#2A5230" }}
            >
              {pct === 0 ? "Start Course" : pct === 100 ? "Review Course" : "Continue Learning"}
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2l4 4-4 4" /></svg>
            </Link>
          )}
        </div>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translateY(40%)" }} />
      </div>

      {/* Outcomes */}
      {course.outcomes && course.outcomes.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "#fff", border: "1px solid #E8EDE6" }}>
          <h2 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>What you&#39;ll learn</h2>
          <ul className="space-y-1.5">
            {(course.outcomes as string[]).map((o: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#4A5E4C" }}>
                <svg viewBox="0 0 14 14" width="14" height="14" className="shrink-0 mt-0.5" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 7l4 4 6-6" />
                </svg>
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Curriculum */}
      <div>
        <h2 className="font-bold text-base mb-4" style={{ color: "#1A2E1C", fontFamily: "var(--font-head)" }}>
          Course Curriculum
        </h2>
        <div className="space-y-3">
          {sortedModules.map((mod, mi) => {
            const modDone = mod.lessons.filter((l) => completedIds.has(l.id)).length;
            const modTotal = mod.lessons.length;
            const modPct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;

            return (
              <div key={mod.id} className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E8EDE6" }}>
                {/* Module header */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #F0F5F0" }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-extrabold"
                    style={{ background: modPct === 100 ? "#EEF5EE" : "#F5FAF5", color: modPct === 100 ? "#2A5230" : "#9AB89E", fontFamily: "var(--font-head)" }}
                  >
                    {modPct === 100 ? (
                      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round"><path d="M2 7l4 4 6-6" /></svg>
                    ) : (mi + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{mod.title}</div>
                    {mod.description && <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "#9AB89E" }}>{mod.description}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-bold" style={{ color: "#4A7A4E" }}>{modDone}/{modTotal}</div>
                    <div className="text-[10px]" style={{ color: "#B8D4B5" }}>{modPct}%</div>
                  </div>
                </div>

                {/* Lessons list */}
                <div className="divide-y" style={{ borderColor: "#F5FAF5" }}>
                  {mod.lessons.map((lesson, li) => {
                    const done = completedIds.has(lesson.id);
                    const isCurrent = lesson.id === nextLesson?.id && !done;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors group"
                        style={{ background: isCurrent ? "#F8FFF8" : "transparent" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            background: done ? "#EEF5EE" : isCurrent ? "#DDE8DA" : "#F5FAF5",
                          }}
                        >
                          {done ? (
                            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          ) : (
                            <span style={{ color: isCurrent ? "#2A5230" : "#B8D4B5" }}>
                              {LESSON_TYPE_ICON[lesson.lesson_type] ?? LESSON_TYPE_ICON.text}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ color: done ? "#9AB89E" : "#1A2E1C", fontWeight: isCurrent ? 600 : 400 }}>
                            {li + 1}. {lesson.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.duration_mins && (
                            <span className="text-[10px]" style={{ color: "#B8D4B5" }}>{lesson.duration_mins}m</span>
                          )}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{
                              background: done ? "#EEF5EE" : "#F0F5F0",
                              color: done ? "#4A7A4E" : "#B8D4B5",
                            }}
                          >
                            {done ? "Done" : lesson.lesson_type}
                          </span>
                          <svg
                            viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "#4A7A4E" }}
                          >
                            <path d="M4 2l4 4-4 4" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
