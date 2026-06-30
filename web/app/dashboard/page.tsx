import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at, completed_at,
      courses (id, title, slug, thumbnail_url, level, certificate_eligible)
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false })
    .limit(5);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, completed")
    .eq("user_id", user.id);

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(title)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })
    .limit(3);

  const progressByCourse: Record<string, { total: number; done: number }> = {};
  for (const p of progress ?? []) {
    if (!progressByCourse[p.course_id]) progressByCourse[p.course_id] = { total: 0, done: 0 };
    progressByCourse[p.course_id].total++;
    if (p.completed) progressByCourse[p.course_id].done++;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  return (
    <div className="max-w-3xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-extrabold text-2xl mb-1" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
          Welcome back, {firstName}
        </h1>
        <p className="text-sm" style={{ color: "#7A9878" }}>
          {enrollments?.length
            ? `You have ${enrollments.length} active course${enrollments.length !== 1 ? "s" : ""} in progress.`
            : "You haven't enrolled in any courses yet."}
        </p>
      </div>

      {/* Continue learning */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Continue Learning
          </h2>
          <Link href="/dashboard/my-courses" className="text-xs font-semibold" style={{ color: "#4A8A52" }}>
            View all →
          </Link>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses as unknown as {
                id: string; title: string; slug: string;
                level: string; certificate_eligible: boolean;
              } | null;
              if (!course) return null;

              const cp = progressByCourse[course.id];
              const pct = cp && cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0;
              const levelColor = course.level === "beginner" ? "#3E9A52"
                : course.level === "intermediate" ? "#2A5230" : "#C48A3A";

              return (
                <div
                  key={course.id}
                  className="rounded-xl p-4 flex items-center gap-4 transition-colors"
                  style={{ background: "#fff", border: "1px solid #E8EDE6" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg"
                    style={{ background: "#EEF5EE", color: "#2A5230", fontFamily: "var(--font-head)" }}
                  >
                    {course.title[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: levelColor }}>
                        {course.level}
                      </span>
                      {course.certificate_eligible && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFF3DC", color: "#9c6c12" }}>
                          Certificate
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm leading-snug truncate" style={{ color: "#1A2E1C" }}>
                      {course.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#4A7A4E" }} />
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: "#7A9878" }}>{pct}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/my-courses/${course.slug}`}
                    className="text-xs font-bold px-3 py-2 rounded-lg shrink-0"
                    style={{ background: "#2A5230", color: "#fff" }}
                  >
                    {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1" style={{ color: "#2A5230" }}>No courses yet</h3>
            <p className="text-xs mb-4" style={{ color: "#9AB89E" }}>Browse the catalog and start your first course — many are free.</p>
            <Link
              href="/courses"
              className="inline-flex items-center text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              Browse Courses →
            </Link>
          </div>
        )}
      </section>

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Certificates</h2>
            <Link href="/dashboard/certificates" className="text-xs font-semibold" style={{ color: "#4A8A52" }}>View all →</Link>
          </div>
          <div className="space-y-2">
            {certificates.map((cert) => {
              const title = (cert.courses as unknown as { title: string } | null)?.title ?? "Certificate";
              return (
                <div
                  key={cert.id}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: "#fff", border: "1px solid #E8EDE6" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3DC" }}>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#9c6c12" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="16" height="12" rx="1.5" />
                      <circle cx="8" cy="10" r="2.5" />
                      <path d="M12 8.5h3M12 10h3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>
                      {cert.certificate_number} · {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <Link href="/dashboard/certificates" className="text-xs font-bold" style={{ color: "#C48A3A" }}>
                    View →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
