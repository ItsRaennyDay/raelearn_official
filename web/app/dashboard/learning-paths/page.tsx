import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LearningPathsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Fetch published bundles with their courses
  const { data: bundles } = await supabase
    .from("bundles")
    .select(`
      id, title, slug, description, price_cents, audience, sort_order,
      bundle_courses(
        sort_order,
        courses(id, title, slug, level, thumbnail_url)
      )
    `)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  // Fetch user's active/completed enrollments to determine access + progress
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, status, completed_at")
    .eq("user_id", user.id)
    .in("status", ["active", "completed"]);

  const enrolledSet = new Set((enrollments ?? []).map((e) => e.course_id));
  const completedSet = new Set(
    (enrollments ?? []).filter((e) => e.status === "completed").map((e) => e.course_id)
  );

  type BundleCourse = {
    sort_order: number;
    courses: { id: string; title: string; slug: string; level: string | null; thumbnail_url: string | null } | null;
  };

  const LEVEL_COLORS: Record<string, string> = {
    beginner: "#EEF5EE",
    intermediate: "#FFF3DC",
    advanced: "#F0E8FF",
  };
  const LEVEL_TEXT: Record<string, string> = {
    beginner: "#2A5230",
    intermediate: "#8A6020",
    advanced: "#5A20A0",
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Learning Paths</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
          Curated course bundles to take you from start to skilled
        </p>
      </div>

      {!bundles || bundles.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </div>
          <p className="font-bold text-sm mb-1" style={{ color: "#2A5230" }}>No learning paths yet</p>
          <p className="text-xs mb-4" style={{ color: "#9AB89E" }}>Check back soon — curated tracks are on the way.</p>
          <Link
            href="/courses"
            className="inline-flex items-center text-sm font-bold px-5 py-2.5 rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Browse Individual Courses →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bundles.map((bundle) => {
            const courses = ((bundle.bundle_courses ?? []) as unknown as BundleCourse[])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((bc) => bc.courses)
              .filter(Boolean) as NonNullable<BundleCourse["courses"]>[];

            const enrolledCount = courses.filter((c) => enrolledSet.has(c.id)).length;
            const completedCount = courses.filter((c) => completedSet.has(c.id)).length;
            const progress = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0;
            const hasAccess = enrolledCount > 0;

            return (
              <div
                key={bundle.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}
              >
                {/* Bundle header */}
                <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #F0F7F0" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-extrabold text-base" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
                          {bundle.title}
                        </h2>
                        {bundle.audience && bundle.audience !== "general" && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                            style={{ background: "#EEF5EE", color: "#2A5230" }}
                          >
                            {bundle.audience}
                          </span>
                        )}
                      </div>
                      {bundle.description && (
                        <p className="text-sm leading-relaxed" style={{ color: "#7A9878" }}>{bundle.description}</p>
                      )}
                    </div>
                    {!hasAccess && bundle.price_cents > 0 && (
                      <Link
                        href={`/bundles/${bundle.slug}`}
                        className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl"
                        style={{ background: "#2A5230", color: "#fff" }}
                      >
                        Get Access
                      </Link>
                    )}
                  </div>

                  {/* Progress bar (only shown if enrolled in at least 1 course) */}
                  {hasAccess && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "#9AB89E" }}>
                        <span>{completedCount} of {courses.length} courses completed</span>
                        <span className="font-bold" style={{ color: progress === 100 ? "#2A5230" : "#9AB89E" }}>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "#EEF5EE" }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%`, background: progress === 100 ? "#4A8A52" : "#2A5230" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Course list */}
                {courses.length > 0 ? (
                  <ul className="divide-y" style={{ borderColor: "#F5FAF5" }}>
                    {courses.map((course, idx) => {
                      const isCompleted = completedSet.has(course.id);
                      const isEnrolled = enrolledSet.has(course.id);
                      const level = course.level?.toLowerCase() ?? "beginner";

                      return (
                        <li key={course.id} className="flex items-center gap-3 px-5 py-3">
                          {/* Step number / check */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{
                              background: isCompleted ? "#2A5230" : isEnrolled ? "#EEF5EE" : "#F5F5F5",
                              color: isCompleted ? "#fff" : isEnrolled ? "#2A5230" : "#999",
                            }}
                          >
                            {isCompleted ? (
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>

                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            {isEnrolled ? (
                              <Link
                                href={`/courses/${course.slug}`}
                                className="text-sm font-medium hover:underline"
                                style={{ color: "#1A2E1C" }}
                              >
                                {course.title}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium" style={{ color: "#999" }}>{course.title}</span>
                            )}
                          </div>

                          {/* Level badge */}
                          {course.level && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 hidden sm:inline"
                              style={{
                                background: LEVEL_COLORS[level] ?? "#F3F3F3",
                                color: LEVEL_TEXT[level] ?? "#666",
                              }}
                            >
                              {course.level}
                            </span>
                          )}

                          {/* Status */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <span className="text-xs font-bold" style={{ color: "#4A8A52" }}>Done</span>
                            ) : isEnrolled ? (
                              <Link
                                href={`/courses/${course.slug}`}
                                className="text-xs font-bold px-3 py-1 rounded-lg"
                                style={{ background: "#EEF5EE", color: "#2A5230" }}
                              >
                                Continue
                              </Link>
                            ) : (
                              <span className="text-xs" style={{ color: "#C8C8C8" }}>Locked</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-sm" style={{ color: "#9AB89E" }}>No courses added to this path yet.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
