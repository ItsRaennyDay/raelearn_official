import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      status,
      enrolled_at,
      completed_at,
      courses (id, title, slug, thumbnail_url, level, certificate_eligible)
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, completed")
    .eq("user_id", user.id);

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(title), learning_paths(title)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  const progressByCourse: Record<string, { total: number; done: number }> = {};
  for (const p of progress ?? []) {
    if (!progressByCourse[p.course_id]) progressByCourse[p.course_id] = { total: 0, done: 0 };
    progressByCourse[p.course_id].total++;
    if (p.completed) progressByCourse[p.course_id].done++;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[var(--color-rl-bg)]">
      {/* Dashboard nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-rl-border)] shadow-sm">
        <div className="max-w-[1100px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-head font-extrabold text-[20px] tracking-tight text-[#2A5230]">RaeLearn</span>
            <span className="text-[8.5px] font-bold tracking-[0.22em] uppercase text-[#8AA080] mt-0.5">by RAEFORM</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-sm font-medium text-[#4A6650] hover:text-[#2A5230] transition-colors hidden sm:block">
              Browse Courses
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm font-semibold text-[#4A6650] hover:text-[#2A5230] transition-colors">
                Sign out
              </button>
            </form>
            <div className="w-9 h-9 rounded-full bg-[#DDE8DA] flex items-center justify-center text-sm font-bold text-[#2A5230] shrink-0">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-head font-extrabold text-2xl text-[#2A5230] mb-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[#7A9878]">
            {enrollments?.length
              ? `You have ${enrollments.length} active course${enrollments.length !== 1 ? "s" : ""}.`
              : "You haven't enrolled in any courses yet."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-head font-bold text-lg text-[#2A5230]">My Courses</h2>
                <Link href="/courses" className="text-xs font-semibold text-[#5A8C5E] hover:underline">
                  Browse more →
                </Link>
              </div>

              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
                    const course = enrollment.courses as unknown as {
                      id: string; title: string; slug: string;
                      thumbnail_url: string | null; level: string; certificate_eligible: boolean;
                    } | null;
                    if (!course) return null;

                    const cp = progressByCourse[course.id];
                    const pct = cp && cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0;
                    const levelColor = course.level === "beginner" ? "#3E9A52"
                      : course.level === "intermediate" ? "#2A5230" : "#C48A3A";

                    return (
                      <div
                        key={course.id}
                        className="bg-white border border-[var(--color-rl-border)] rounded-xl p-5 flex items-center gap-4 hover:border-[#B8D4B5] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-[10px] bg-[#DDE8DA] flex items-center justify-center shrink-0 text-xl">
                          📚
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: levelColor }}>
                              {course.level}
                            </span>
                            {course.certificate_eligible && (
                              <span className="text-[10px] font-bold bg-[#FFF3DC] text-[#9c6c12] px-2 py-0.5 rounded-full">
                                Certificate
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-[#2A5230] text-sm leading-snug truncate">
                            {course.title}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#EAF2EA] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#4A7A4E] rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-[#7A9878] shrink-0">{pct}%</span>
                          </div>
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="text-xs font-semibold text-[#2A5230] border border-[#DDE8DA] px-3 py-2 rounded-lg hover:bg-[#EAF2EA] transition-colors whitespace-nowrap shrink-0"
                        >
                          {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[var(--color-rl-border)] rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📖</div>
                  <h3 className="font-semibold text-[#2A5230] mb-1">No courses yet</h3>
                  <p className="text-sm text-[#7A9878] mb-4">Browse our catalog and start your first course — many are free.</p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center text-sm font-bold text-white bg-[#2A5230] px-5 py-2.5 rounded-lg hover:bg-[#1e3d24] transition-colors"
                  >
                    Browse Courses →
                  </Link>
                </div>
              )}
            </section>

            {/* Certificates */}
            <section>
              <h2 className="font-head font-bold text-lg text-[#2A5230] mb-4">Certificates</h2>

              {certificates && certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.map((cert) => {
                    const title = (cert.courses as unknown as { title: string } | null)?.title
                      ?? (cert.learning_paths as unknown as { title: string } | null)?.title
                      ?? "Certificate";
                    return (
                      <div
                        key={cert.id}
                        className="bg-white border border-[var(--color-rl-border)] rounded-xl p-5 flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#9c6c12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="9" r="5" />
                            <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#2A5230] text-sm">{title}</div>
                          <div className="text-xs text-[#7A9878] mt-0.5">
                            {cert.certificate_number} · Issued {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[var(--color-rl-border)] rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="text-sm text-[#7A9878]">Complete a certificate-eligible course to earn your first certificate.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Account card */}
            <div className="bg-white border border-[var(--color-rl-border)] rounded-xl p-5">
              <h3 className="font-head font-bold text-sm text-[#2A5230] mb-3">Account</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#DDE8DA] flex items-center justify-center text-base font-bold text-[#2A5230] shrink-0">
                  {firstName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2A5230]">{profile?.full_name ?? "—"}</div>
                  <div className="text-xs text-[#7A9878]">{user.email}</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[#7A9878] uppercase tracking-wide mb-1">Role</div>
              <div className="text-sm text-[#4A6650] capitalize">{(profile?.role ?? "learner").replace(/_/g, " ")}</div>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-[var(--color-rl-border)] rounded-xl p-5">
              <h3 className="font-head font-bold text-sm text-[#2A5230] mb-3">Quick links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/courses?access=free" className="text-sm text-[#4A6650] hover:text-[#2A5230] transition-colors flex items-center gap-2">
                  <span>→</span> Free courses
                </Link>
                <Link href="/courses?lvl=beginner" className="text-sm text-[#4A6650] hover:text-[#2A5230] transition-colors flex items-center gap-2">
                  <span>→</span> Beginner courses
                </Link>
                <Link href="/pricing" className="text-sm text-[#4A6650] hover:text-[#2A5230] transition-colors flex items-center gap-2">
                  <span>→</span> Group pricing
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#2A5230] rounded-xl p-5 text-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-extrabold">{enrollments?.length ?? 0}</div>
                  <div className="text-xs text-[#A8C4A4] mt-0.5">Courses enrolled</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{certificates?.length ?? 0}</div>
                  <div className="text-xs text-[#A8C4A4] mt-0.5">Certificates earned</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
