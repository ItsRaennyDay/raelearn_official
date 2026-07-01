import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const LEVEL_META: Record<string, { color: string; bg: string }> = {
  beginner:     { color: "#2A7A3A", bg: "#EEF8F0" },
  intermediate: { color: "#8A5A10", bg: "#FFF5DC" },
  advanced:     { color: "#7A2020", bg: "#FFF0F0" },
};

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [enrollRes, progressRes, certRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select(`id, status, enrolled_at, completed_at, source, courses(id, title, slug, level, certificate_eligible, description)`)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("course_id, completed, time_spent_seconds")
      .eq("user_id", user.id),
    supabase
      .from("certificates")
      .select("id, course_id")
      .eq("user_id", user.id),
  ]);

  const enrollments = enrollRes.data ?? [];
  const progress = progressRes.data ?? [];
  const certsByCourse = new Set((certRes.data ?? []).map((c) => c.course_id));

  // Fetch real lesson counts for enrolled courses (not just touched lessons)
  const courseIds = enrollments
    .map((e) => (e.courses as unknown as { id: string } | null)?.id)
    .filter(Boolean) as string[];

  const { data: lessonRows } = courseIds.length > 0
    ? await supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds)
        .eq("status", "published")
    : { data: [] };

  const lessonCountByCourse: Record<string, number> = {};
  for (const l of lessonRows ?? []) {
    lessonCountByCourse[l.course_id] = (lessonCountByCourse[l.course_id] ?? 0) + 1;
  }

  // Track completed lessons and time per course from lesson_progress
  const progressByCourse: Record<string, { done: number; timeSecs: number }> = {};
  for (const p of progress) {
    if (!progressByCourse[p.course_id]) progressByCourse[p.course_id] = { done: 0, timeSecs: 0 };
    progressByCourse[p.course_id].timeSecs += p.time_spent_seconds ?? 0;
    if (p.completed) progressByCourse[p.course_id].done++;
  }

  const active    = enrollments.filter((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed");
  const expired   = enrollments.filter((e) => e.status === "expired" || e.status === "revoked");

  const avgPct = active.length > 0
    ? Math.round(
        active.reduce((sum, e) => {
          const c = e.courses as unknown as { id: string } | null;
          if (!c) return sum;
          const cp = progressByCourse[c.id];
          const total = lessonCountByCourse[c.id] ?? 0;
          return sum + (cp && total > 0 ? (cp.done / total) * 100 : 0);
        }, 0) / active.length
      )
    : 0;

  function fmtTime(secs: number) {
    const m = Math.round(secs / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ""}`.trim();
  }

  type Enrollment = typeof enrollments[0];

  function CourseCard({ enrollment, dim = false }: { enrollment: Enrollment; dim?: boolean }) {
    const course = enrollment.courses as unknown as {
      id: string; title: string; slug: string; level: string;
      certificate_eligible: boolean; description: string | null;
    } | null;
    if (!course) return null;

    const cp = progressByCourse[course.id];
    const totalLessons = lessonCountByCourse[course.id] ?? 0;
    const pct = cp && totalLessons > 0 ? Math.round((cp.done / totalLessons) * 100) : 0;
    const lm = LEVEL_META[course.level?.toLowerCase()] ?? { color: "#7A9878", bg: "#F5FAF5" };
    const hasCert = certsByCourse.has(course.id);
    const isCompleted = enrollment.status === "completed";
    const initial = course.title[0]?.toUpperCase() ?? "C";

    const ctaLabel = isCompleted ? "Review" : pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue";

    return (
      <div
        className="rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
        style={{ background: "#fff", border: `1.5px solid ${dim ? "#EEEEEE" : "#E8EDE6"}`, opacity: dim ? 0.65 : 1 }}
      >
        <div className="flex gap-0">
          {/* Color accent strip */}
          <div
            className="w-1.5 shrink-0"
            style={{
              background: isCompleted
                ? "linear-gradient(180deg,#4A8A52,#2A5230)"
                : pct > 0
                ? "linear-gradient(180deg,#2A5230,#7AB87E)"
                : "#EEF5EE",
            }}
          />

          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xl"
                style={{
                  background: isCompleted ? "#2A5230" : "#EEF5EE",
                  color: isCompleted ? "#fff" : "#2A5230",
                  fontFamily: "var(--font-head)",
                }}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10l5 5 7-7" />
                  </svg>
                ) : initial}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: lm.bg, color: lm.color }}>
                    {course.level}
                  </span>
                  {course.certificate_eligible && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3DC", color: "#9c6c12" }}>Certificate</span>
                  )}
                  {enrollment.source === "admin_grant" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#E8F2FF", color: "#1A4A8A" }}>Assigned</span>
                  )}
                  {hasCert && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3DC", color: "#9c6c12" }}>🏅 Earned</span>
                  )}
                </div>

                <Link href={`/dashboard/my-courses/${course.slug}`}>
                  <h3 className="font-bold text-sm sm:text-base leading-snug hover:underline" style={{ color: "#1A2E1C" }}>
                    {course.title}
                  </h3>
                </Link>

                {course.description && (
                  <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: "#9AB89E" }}>
                    {course.description}
                  </p>
                )}

                {/* Progress */}
                {enrollment.status === "active" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: "#9AB89E" }}>
                        {totalLessons > 0 ? `${cp?.done ?? 0} of ${totalLessons} lessons` : "No lessons started"}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: pct === 100 ? "#4A8A52" : "#7A9878" }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: pct === 100 ? "#4A8A52" : "linear-gradient(90deg,#2A5230,#5AAA5A)" }}
                      />
                    </div>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px]" style={{ color: "#B8D4B5" }}>
                  {enrollment.enrolled_at && (
                    <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                  {enrollment.completed_at && (
                    <span style={{ color: "#4A8A52" }}>✓ Completed {new Date(enrollment.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                  {cp && cp.timeSecs > 0 && (
                    <span>{fmtTime(cp.timeSecs)} spent</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 flex flex-col gap-2 items-end">
                <Link
                  href={`/dashboard/my-courses/${course.slug}`}
                  className="text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap"
                  style={{
                    background: isCompleted ? "#F5FAF5" : "#2A5230",
                    color: isCompleted ? "#2A5230" : "#fff",
                    border: isCompleted ? "1px solid #C8DEC8" : "none",
                  }}
                >
                  {ctaLabel} →
                </Link>
                {hasCert && (
                  <Link
                    href="/dashboard/certificates"
                    className="text-[10px] font-bold px-3 py-1 rounded-lg whitespace-nowrap"
                    style={{ background: "#FFF3DC", color: "#9c6c12" }}
                  >
                    View cert
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>My Courses</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/courses"
          className="text-sm font-bold px-4 py-2 rounded-xl shrink-0 self-start sm:self-auto"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Browse more courses →
        </Link>
      </div>

      {/* Stats row */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Active", value: active.length, color: "#2A5230", bg: "#EEF5EE" },
            { label: "Completed", value: completed.length, color: "#8A6020", bg: "#FFF3DC" },
            { label: "Avg progress", value: active.length > 0 ? `${avgPct}%` : "—", color: "#1A4A8A", bg: "#E8F2FF" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
              <div className="font-extrabold text-xl" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {enrollments.length === 0 && (
        <div className="rounded-2xl p-14 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.042A9 9 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A9 9 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a9 9 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A9 9 0 0 0 18 18a9 9 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="font-bold text-base mb-1" style={{ color: "#2A5230" }}>No courses yet</h3>
          <p className="text-sm mb-5" style={{ color: "#9AB89E" }}>Browse the catalog — many courses are free to start.</p>
          <Link href="/courses" className="inline-flex items-center text-sm font-bold px-6 py-3 rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
            Browse Courses →
          </Link>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: "#4A8A52" }} />
            <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>In Progress <span className="font-normal" style={{ color: "#9AB89E" }}>({active.length})</span></h2>
          </div>
          <div className="space-y-3">
            {active.map((e) => <CourseCard key={e.id} enrollment={e} />)}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: "#C48A3A" }} />
            <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Completed <span className="font-normal" style={{ color: "#9AB89E" }}>({completed.length})</span></h2>
          </div>
          <div className="space-y-3">
            {completed.map((e) => <CourseCard key={e.id} enrollment={e} />)}
          </div>
        </section>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: "#C8C8C8" }} />
            <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Expired / Revoked <span className="font-normal" style={{ color: "#9AB89E" }}>({expired.length})</span></h2>
          </div>
          <div className="space-y-3">
            {expired.map((e) => <CourseCard key={e.id} enrollment={e} dim />)}
          </div>
        </section>
      )}
    </div>
  );
}
