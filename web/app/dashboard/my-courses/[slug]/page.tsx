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

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, description, outcomes, level, certificate_eligible, thumbnail_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, status, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  if (!enrollment || enrollment.status === "cancelled") redirect(`/courses/${slug}`);

  const { data: modules } = await supabase
    .from("modules")
    .select(`id, title, description, sort_order, lessons(id, title, lesson_type, duration_mins, sort_order, status)`)
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

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, time_spent_seconds")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  const completedIds = new Set((progressRows ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const completedCount = completedIds.size;
  const totalCount = allLessons.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const timeSpentSecs = (progressRows ?? []).reduce((s, p) => s + (p.time_spent_seconds ?? 0), 0);

  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0];

  const totalDurationMins = allLessons.reduce((s, l) => s + (l.duration_mins ?? 0), 0);
  const lessonTypeCounts = allLessons.reduce<Record<string, number>>((acc, l) => {
    acc[l.lesson_type] = (acc[l.lesson_type] ?? 0) + 1;
    return acc;
  }, {});

  function fmtDuration(mins: number) {
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim();
  }
  function fmtSecs(secs: number) {
    const m = Math.round(secs / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ""}`.trim();
  }

  const enrolledDate = enrollment.enrolled_at
    ? new Date(enrollment.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

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

  // Circumference for the progress ring
  const R = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - pct / 100);

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "#9AB89E" }}>
        <Link href="/dashboard/my-courses" className="hover:underline" style={{ color: "#4A7A4E" }}>My Courses</Link>
        <span>›</span>
        <span style={{ color: "#1A2E1C", fontWeight: 600 }}>{course.title}</span>
      </nav>

      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#2A5230 0%,#1A3A20 100%)" }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full capitalize"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
              >
                {course.level}
              </span>
              {course.certificate_eligible && (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,215,0,0.18)", color: "#FFD700" }}
                >
                  Certificate
                </span>
              )}
              {pct === 100 && (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(74,222,128,0.2)", color: "#4ADE80" }}
                >
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "var(--font-head)" }}>
              {course.title}
            </h1>
            {course.description && (
              <p className="text-sm leading-relaxed line-clamp-2 sm:line-clamp-3" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 520 }}>
                {course.description}
              </p>
            )}
          </div>
          {/* Mini progress ring */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 88 88" width="80" height="80" className="rotate-[-90deg]">
                <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="44" cy="44" r={R} fill="none"
                  stroke={pct === 100 ? "#4ADE80" : "#A8D5B0"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dash}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-extrabold text-sm text-white" style={{ fontFamily: "var(--font-head)" }}>{pct}%</span>
              </div>
            </div>
            {nextLesson && (
              <Link
                href={`/learn/${nextLesson.id}`}
                className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
                style={{ background: "#fff", color: "#2A5230" }}
              >
                {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2l4 4-4 4" /></svg>
              </Link>
            )}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.03)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 right-24 w-36 h-36 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.03)", transform: "translateY(50%)" }} />
      </div>

      {/* ── 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: outcomes + curriculum */}
        <div className="lg:col-span-2 space-y-5">

          {/* What you'll learn */}
          {course.outcomes && (course.outcomes as string[]).length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
              <h2 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>What you&apos;ll learn</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {(course.outcomes as string[]).map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#4A5E4C" }}>
                    <svg viewBox="0 0 14 14" width="14" height="14" className="shrink-0 mt-0.5" fill="none" stroke="#4A8A52" strokeWidth="2" strokeLinecap="round">
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
            <h2 className="font-bold text-base mb-3" style={{ color: "#1A2E1C", fontFamily: "var(--font-head)" }}>
              Course Curriculum
            </h2>
            <div className="space-y-3">
              {sortedModules.map((mod, mi) => {
                const modDone = mod.lessons.filter((l) => completedIds.has(l.id)).length;
                const modTotal = mod.lessons.length;
                const modPct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;
                const modComplete = modPct === 100;

                return (
                  <div key={mod.id} className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
                    <div
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={{ borderBottom: mod.lessons.length > 0 ? "1px solid #F0F5F0" : undefined }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-extrabold"
                        style={{
                          background: modComplete ? "#2A5230" : "#F5FAF5",
                          color: modComplete ? "#fff" : "#9AB89E",
                          fontFamily: "var(--font-head)",
                        }}
                      >
                        {modComplete ? (
                          <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 7l4 4 6-6" /></svg>
                        ) : (mi + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{mod.title}</div>
                        {mod.description && (
                          <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "#9AB89E" }}>{mod.description}</div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-bold" style={{ color: modComplete ? "#4A8A52" : "#9AB89E" }}>
                          {modDone}/{modTotal}
                        </div>
                      </div>
                    </div>

                    <div className="divide-y" style={{ borderColor: "#F5FAF5" }}>
                      {mod.lessons.map((lesson, li) => {
                        const done = completedIds.has(lesson.id);
                        const isCurrent = lesson.id === nextLesson?.id && !done;
                        return (
                          <Link
                            key={lesson.id}
                            href={`/learn/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-3 transition-colors group"
                            style={{ background: isCurrent ? "#F5FBF5" : "transparent" }}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                              style={{
                                background: done ? "#2A5230" : isCurrent ? "#EEF5EE" : "#F5FAF5",
                              }}
                            >
                              {done ? (
                                <svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                                  <path d="M2 6l3 3 5-5" />
                                </svg>
                              ) : (
                                <span style={{ color: isCurrent ? "#2A5230" : "#C8DEC8" }}>
                                  {LESSON_TYPE_ICON[lesson.lesson_type] ?? LESSON_TYPE_ICON.text}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm truncate"
                                style={{
                                  color: done ? "#9AB89E" : "#1A2E1C",
                                  fontWeight: isCurrent ? 600 : 400,
                                  textDecoration: done ? "line-through" : "none",
                                }}
                              >
                                {li + 1}. {lesson.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {lesson.duration_mins && (
                                <span className="text-[10px]" style={{ color: "#C8DEC8" }}>{lesson.duration_mins}m</span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EEF5EE", color: "#2A5230" }}>
                                  Up next
                                </span>
                              )}
                              <svg
                                viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#C8DEC8" strokeWidth="1.5" strokeLinecap="round"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* ── Right sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-20 self-start">

          {/* Progress card */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <h3 className="font-bold text-sm mb-4" style={{ color: "#1A2E1C" }}>Your Progress</h3>

            {/* Ring + stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative shrink-0 w-16 h-16">
                <svg viewBox="0 0 88 88" width="64" height="64" className="rotate-[-90deg]">
                  <circle cx="44" cy="44" r={R} fill="none" stroke="#EEF5EE" strokeWidth="10" />
                  <circle
                    cx="44" cy="44" r={R} fill="none"
                    stroke={pct === 100 ? "#4A8A52" : "#2A5230"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-extrabold text-sm" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>{pct}%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div>
                  <div className="text-xs" style={{ color: "#9AB89E" }}>Lessons</div>
                  <div className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{completedCount} / {totalCount}</div>
                </div>
                {timeSpentSecs > 0 && (
                  <div>
                    <div className="text-xs" style={{ color: "#9AB89E" }}>Time spent</div>
                    <div className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{fmtSecs(timeSpentSecs)}</div>
                  </div>
                )}
                {enrolledDate && (
                  <div>
                    <div className="text-xs" style={{ color: "#9AB89E" }}>Enrolled</div>
                    <div className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{enrolledDate}</div>
                  </div>
                )}
              </div>
            </div>

            {nextLesson && (
              <Link
                href={`/learn/${nextLesson.id}`}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl"
                style={{ background: "#2A5230", color: "#fff" }}
              >
                {pct === 0 ? "Start Course" : pct === 100 ? "Review Course" : "Continue Learning"}
                <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2l4 4-4 4" /></svg>
              </Link>
            )}
          </div>

          {/* Course details */}
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>Course Details</h3>
            <div className="space-y-3">
              {[
                {
                  label: "Level",
                  value: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : "—",
                  icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 12V8m3 4V6m3 6V4m3 6V2" /></svg>,
                },
                ...(totalDurationMins > 0 ? [{
                  label: "Total duration",
                  value: fmtDuration(totalDurationMins),
                  icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 2" /></svg>,
                }] : []),
                {
                  label: "Modules",
                  value: `${sortedModules.length}`,
                  icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="3" width="12" height="3" rx="1" /><rect x="1" y="8" width="12" height="3" rx="1" /></svg>,
                },
                {
                  label: "Lessons",
                  value: `${totalCount}`,
                  icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h6" /></svg>,
                },
                ...(course.certificate_eligible ? [{
                  label: "Certificate",
                  value: "Included",
                  icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="3" width="12" height="8" rx="1" /><circle cx="5" cy="7" r="2" /><path d="M8 6h3M8 8h2" /></svg>,
                  accent: true,
                }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#9AB89E" }}>{row.icon}</span>
                    <span className="text-xs" style={{ color: "#7A9878" }}>{row.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: ("accent" in row && row.accent) ? "#C48A3A" : "#1A2E1C" }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Lesson type breakdown */}
            {Object.keys(lessonTypeCounts).length > 1 && (
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid #F0F5F0" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: "#9AB89E" }}>Lesson types</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lessonTypeCounts).map(([type, count]) => (
                    <span
                      key={type}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: "#F5FAF5", color: "#4A7A4E" }}
                    >
                      {count} {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Certificate prompt */}
          {course.certificate_eligible && pct === 100 && (
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: "linear-gradient(135deg,#FFF8DC,#FFF3C0)", border: "1.5px solid #FFE680" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(255,215,0,0.2)" }}>
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="#9c6c12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" /><path d="M10.5 12 12 18l-4-2-4 2 1.5-6" />
                </svg>
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: "#8A6020" }}>Course completed!</div>
              <p className="text-xs mb-3" style={{ color: "#C4A050" }}>Your certificate is ready to download.</p>
              <Link
                href="/dashboard/certificates"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: "#9c6c12", color: "#fff" }}
              >
                View Certificate →
              </Link>
            </div>
          )}

          {/* Encouragement when not complete */}
          {course.certificate_eligible && pct > 0 && pct < 100 && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "#F5FAF5", border: "1.5px dashed #C8DEC8" }}
            >
              <div className="text-xs font-semibold mb-0.5" style={{ color: "#2A5230" }}>
                {totalCount - completedCount} lesson{totalCount - completedCount !== 1 ? "s" : ""} to go
              </div>
              <p className="text-xs" style={{ color: "#7A9878" }}>
                Complete all lessons to earn your certificate.
              </p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#DDE8DA" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#4A8A52" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
