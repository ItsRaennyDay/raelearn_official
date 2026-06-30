import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at, completed_at, source,
      courses (id, title, slug, level, price_type, certificate_eligible, description)
    `)
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, completed")
    .eq("user_id", user.id);

  const progressByCourse: Record<string, { total: number; done: number }> = {};
  for (const p of progress ?? []) {
    if (!progressByCourse[p.course_id]) progressByCourse[p.course_id] = { total: 0, done: 0 };
    progressByCourse[p.course_id].total++;
    if (p.completed) progressByCourse[p.course_id].done++;
  }

  const active    = (enrollments ?? []).filter((e) => e.status === "active");
  const completed = (enrollments ?? []).filter((e) => e.status === "completed");
  const expired   = (enrollments ?? []).filter((e) => e.status === "expired" || e.status === "cancelled");

  const CourseCard = ({ enrollment }: { enrollment: typeof active[0] }) => {
    const course = enrollment.courses as unknown as {
      id: string; title: string; slug: string; level: string;
      price_type: string; certificate_eligible: boolean; description: string | null;
    } | null;
    if (!course) return null;

    const cp = progressByCourse[course.id];
    const pct = cp && cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0;
    const levelColor = course.level === "beginner" ? "#3E9A52" : course.level === "intermediate" ? "#2A5230" : "#C48A3A";

    return (
      <div className="rounded-xl p-4 flex items-start gap-4 transition-colors group" style={{ background: "#fff", border: "1px solid #E8EDE6" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg" style={{ background: "#EEF5EE", color: "#2A5230", fontFamily: "var(--font-head)" }}>
          {course.title[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: levelColor }}>{course.level}</span>
            {course.certificate_eligible && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFF3DC", color: "#9c6c12" }}>Certificate</span>
            )}
            {enrollment.source === "admin" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E8F2FF", color: "#1A4A8A" }}>Assigned</span>
            )}
          </div>
          <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{course.title}</div>
          {enrollment.status === "active" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#4A7A4E" }} />
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: "#7A9878" }}>{pct}%</span>
            </div>
          )}
          {enrollment.completed_at && (
            <div className="text-xs mt-1" style={{ color: "#9AB89E" }}>
              Completed {new Date(enrollment.completed_at).toLocaleDateString()}
            </div>
          )}
        </div>
        {enrollment.status === "active" && (
          <Link href={`/dashboard/my-courses/${course.slug}`} className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0" style={{ background: "#2A5230", color: "#fff" }}>
            {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>My Courses</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{enrollments?.length ?? 0} total enrollments</p>
      </div>

      {(!enrollments || enrollments.length === 0) && (
        <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="font-bold text-sm mb-2" style={{ color: "#2A5230" }}>No courses yet</h3>
          <Link href="/courses" className="inline-flex items-center text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
            Browse Courses →
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: "#9AB89E" }}>Active ({active.length})</h2>
          <div className="space-y-3">{active.map((e) => <CourseCard key={e.id} enrollment={e} />)}</div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: "#9AB89E" }}>Completed ({completed.length})</h2>
          <div className="space-y-3">{completed.map((e) => <CourseCard key={e.id} enrollment={e} />)}</div>
        </section>
      )}

      {expired.length > 0 && (
        <section>
          <h2 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: "#9AB89E" }}>Expired / Cancelled ({expired.length})</h2>
          <div className="space-y-3 opacity-60">{expired.map((e) => <CourseCard key={e.id} enrollment={e} />)}</div>
        </section>
      )}
    </div>
  );
}
