import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtMinutes(secs: number) {
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [profileRes, enrollRes, progressRes, certRes, notifRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("enrollments")
      .select(`id, status, enrolled_at, completed_at, courses(id, title, slug, level, certificate_eligible)`)
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("course_id, completed, completed_at, time_spent_seconds")
      .eq("user_id", user.id),
    supabase
      .from("certificates")
      .select("id, certificate_number, issued_at, courses(title)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .limit(3),
    supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "unread"),
  ]);

  const profile = profileRes.data;
  const allEnrollments = enrollRes.data ?? [];
  const progress = progressRes.data ?? [];
  const certificates = certRes.data ?? [];
  const unreadCount = notifRes.data?.length ?? 0;

  const activeEnrollments = allEnrollments.filter((e) => e.status === "active");
  const completedCourses = allEnrollments.filter((e) => e.status === "completed").length;

  // Progress stats per course
  const progressByCourse: Record<string, { total: number; done: number }> = {};
  for (const p of progress) {
    if (!progressByCourse[p.course_id]) progressByCourse[p.course_id] = { total: 0, done: 0 };
    progressByCourse[p.course_id].total++;
    if (p.completed) progressByCourse[p.course_id].done++;
  }

  const totalLessonsDone = progress.filter((p) => p.completed).length;
  const totalTimeSecs = progress.reduce((sum, p) => sum + (p.time_spent_seconds ?? 0), 0);

  // This week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thisWeekLessons = progress.filter(
    (p) => p.completed && p.completed_at && p.completed_at >= oneWeekAgo
  ).length;

  // Average completion across active enrollments
  const activeCourseObjs = activeEnrollments.map((e) => {
    const c = e.courses as unknown as { id: string; title: string; slug: string; level: string; certificate_eligible: boolean } | null;
    if (!c) return null;
    const cp = progressByCourse[c.id];
    const pct = cp && cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0;
    return { ...c, pct };
  }).filter(Boolean) as { id: string; title: string; slug: string; level: string; certificate_eligible: boolean; pct: number }[];

  const avgProgress = activeCourseObjs.length > 0
    ? Math.round(activeCourseObjs.reduce((s, c) => s + c.pct, 0) / activeCourseObjs.length)
    : 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  const LEVEL_COLOR: Record<string, string> = {
    beginner: "#3E9A52",
    intermediate: "#2A5230",
    advanced: "#C48A3A",
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Greeting header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: "#9AB89E" }}>{today}</p>
          <h1 className="font-extrabold text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            {greet()}, {firstName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A9878" }}>
            {activeEnrollments.length > 0
              ? `You have ${activeEnrollments.length} active course${activeEnrollments.length !== 1 ? "s" : ""}. Keep it up!`
              : "Ready to start learning? Browse the catalog below."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl shrink-0"
            style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "#4A8A52" }} />
            {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* ── Stats tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Active Courses",
            value: activeEnrollments.length,
            sub: completedCourses > 0 ? `${completedCourses} completed` : "in progress",
            bg: "#EEF5EE", color: "#2A5230", subColor: "#7A9878",
            icon: (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 4.804A8 8 0 0 0 5.5 4C4.245 4 3.057 4.29 2 4.804v10A8 8 0 0 1 5.5 14c1.67 0 3.22.51 4.5 1.385A7.962 7.962 0 0 1 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804Z" />
              </svg>
            ),
          },
          {
            label: "Lessons Done",
            value: totalLessonsDone,
            sub: thisWeekLessons > 0 ? `${thisWeekLessons} this week` : "total",
            bg: "#E8F2FF", color: "#1A4A8A", subColor: "#5A7AAA",
            icon: (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m-5-7a7 7 0 1 0 0 14A7 7 0 0 0 10 3Z" />
              </svg>
            ),
          },
          {
            label: "Certificates",
            value: certificates.length,
            sub: certificates.length > 0 ? "earned" : "complete a course",
            bg: "#FFF3DC", color: "#8A6020", subColor: "#C4A070",
            icon: (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="12" rx="1.5" /><circle cx="8" cy="10" r="2.5" /><path d="M12 8.5h3M12 10h3" />
              </svg>
            ),
          },
          {
            label: "Time Spent",
            value: totalTimeSecs > 0 ? fmtMinutes(totalTimeSecs) : "—",
            sub: "total learning",
            bg: "#F5F0FF", color: "#5A20A0", subColor: "#9060C0",
            icon: (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" /><path d="M10 6v4l2.5 2.5" />
              </svg>
            ),
          },
        ].map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tile.bg, color: tile.color }}>
                {tile.icon}
              </div>
            </div>
            <div>
              <div className="font-extrabold text-2xl leading-none" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
                {tile.value}
              </div>
              <div className="text-xs font-medium mt-0.5" style={{ color: "#9AB89E" }}>{tile.label}</div>
              <div className="text-[10px] mt-0.5 font-semibold" style={{ color: tile.subColor }}>{tile.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Continue Learning (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Continue Learning</h2>
            <Link href="/dashboard/my-courses" className="text-xs font-semibold" style={{ color: "#4A8A52" }}>View all →</Link>
          </div>

          {activeCourseObjs.length > 0 ? (
            <div className="space-y-3">
              {activeCourseObjs.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: "#fff", border: "1px solid #E8EDE6" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg"
                    style={{ background: "#EEF5EE", color: "#2A5230", fontFamily: "var(--font-head)" }}
                  >
                    {course.title[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: LEVEL_COLOR[course.level?.toLowerCase()] ?? "#7A9878" }}
                      >
                        {course.level}
                      </span>
                      {course.certificate_eligible && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFF3DC", color: "#9c6c12" }}>
                          Certificate
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm leading-snug" style={{ color: "#1A2E1C" }}>
                      {course.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${course.pct}%`, background: course.pct === 100 ? "#4A8A52" : "#2A5230" }}
                        />
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: "#7A9878" }}>{course.pct}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/my-courses/${course.slug}`}
                    className="text-xs font-bold px-3 py-2 rounded-lg shrink-0"
                    style={{ background: "#2A5230", color: "#fff" }}
                  >
                    {course.pct === 0 ? "Start" : course.pct === 100 ? "Review" : "Continue"}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-10 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6.042A9 9 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A9 9 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a9 9 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A9 9 0 0 0 18 18a9 9 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "#2A5230" }}>No courses yet</p>
              <p className="text-xs mb-4" style={{ color: "#9AB89E" }}>Browse the catalog — many courses are free to start.</p>
              <Link
                href="/courses"
                className="inline-flex items-center text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: "#2A5230", color: "#fff" }}
              >
                Browse Courses →
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar (1/3 width) */}
        <div className="space-y-4">

          {/* Overall progress */}
          {activeCourseObjs.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>Overall Progress</h3>
              <div className="flex items-end gap-3 mb-3">
                <div className="font-extrabold text-3xl leading-none" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>
                  {avgProgress}%
                </div>
                <div className="text-xs pb-0.5" style={{ color: "#9AB89E" }}>avg. completion</div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${avgProgress}%`, background: "linear-gradient(90deg, #2A5230, #4A8A52)" }}
                />
              </div>
              <div className="mt-3 space-y-2">
                {activeCourseObjs.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="text-xs truncate flex-1" style={{ color: "#7A9878" }}>{c.title}</div>
                    <div className="text-[10px] font-bold shrink-0" style={{ color: c.pct === 100 ? "#4A8A52" : "#9AB89E" }}>{c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* This week activity */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EEF5EE" }}>
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#2A5230" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 10 6 8l2-2 2 2-2 2ZM2 8h2m8 0h2M8 2v2m0 8v2" />
                    </svg>
                  </div>
                  <span className="text-xs" style={{ color: "#7A9878" }}>Lessons</span>
                </div>
                <span className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{thisWeekLessons}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E8F2FF" }}>
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#1A4A8A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
                    </svg>
                  </div>
                  <span className="text-xs" style={{ color: "#7A9878" }}>Time</span>
                </div>
                <span className="font-bold text-sm" style={{ color: "#1A2E1C" }}>
                  {totalTimeSecs > 0 ? fmtMinutes(totalTimeSecs) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FFF3DC" }}>
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#8A6020" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="6" r="3.5" /><path d="M10.5 9.5 11.5 14l-3.5-2-3.5 2L5.5 9.5" />
                    </svg>
                  </div>
                  <span className="text-xs" style={{ color: "#7A9878" }}>Certs earned</span>
                </div>
                <span className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{certificates.length}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>Quick Links</h3>
            <div className="space-y-1">
              {[
                { label: "Browse courses", href: "/courses", color: "#2A5230" },
                { label: "My certificates", href: "/dashboard/certificates", color: "#8A6020" },
                { label: "Learning paths", href: "/dashboard/learning-paths", color: "#1A4A8A" },
                { label: "Notifications", href: "/dashboard/notifications", color: "#5A20A0", badge: unreadCount > 0 ? unreadCount : null },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-[#FAFCFA]"
                  style={{ color: "#4A6650" }}
                >
                  <span>{l.label}</span>
                  <div className="flex items-center gap-1.5">
                    {l.badge && (
                      <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#EEF5EE", color: l.color }}>
                        {l.badge}
                      </span>
                    )}
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#C8C8C8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 2l4 4-4 4" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Certificates ── */}
      {certificates.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>My Certificates</h2>
            <Link href="/dashboard/certificates" className="text-xs font-semibold" style={{ color: "#4A8A52" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {certificates.map((cert) => {
              const title = (cert.courses as unknown as { title: string } | null)?.title ?? "Certificate";
              return (
                <Link
                  key={cert.id}
                  href={`/dashboard/certificates/${cert.id}`}
                  className="rounded-xl p-4 flex items-center gap-3 transition-colors hover:border-[#C8DEC8]"
                  style={{ background: "#fff", border: "1px solid #E8EDE6" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3DC" }}>
                    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="#9c6c12" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="16" height="12" rx="1.5" /><circle cx="8" cy="10" r="2.5" /><path d="M12 8.5h3M12 10h3" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs leading-snug line-clamp-2" style={{ color: "#1A2E1C" }}>{title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#9AB89E" }}>
                      {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#C8C8C8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M4 2l4 4-4 4" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
