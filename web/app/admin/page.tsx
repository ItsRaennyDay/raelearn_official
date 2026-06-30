import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOverviewPage() {
  const db = createAdminClient();

  const [
    { count: courseCount },
    { count: enrollmentCount },
    { count: userCount },
    { data: recentCourses },
  ] = await Promise.all([
    db.from("courses").select("*", { count: "exact", head: true }),
    db.from("enrollments").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("courses")
      .select("id, title, slug, status, level, price_type, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Total Courses",
      value: courseCount ?? 0,
      href: "/admin/courses",
      accent: "#2A5230",
      bg: "#EEF5EE",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Published & draft",
      trend: "+0 this week",
    },
    {
      label: "Enrollments",
      value: enrollmentCount ?? 0,
      href: "/admin/courses",
      accent: "#6B4FBB",
      bg: "#F0ECFF",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      description: "Active learners enrolled",
      trend: "+0 this week",
    },
    {
      label: "Total Learners",
      value: userCount ?? 0,
      href: "/admin/courses",
      accent: "#B86B4A",
      bg: "#FFF3EE",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      description: "Registered accounts",
      trend: "+0 this week",
    },
  ];

  const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
    published: { bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
    draft:     { bg: "#FFF8E8", text: "#8A6020", dot: "#C48A3A" },
    archived:  { bg: "#F3F3F3", text: "#666", dot: "#999" },
  };

  const levelLabel: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{ background: "#EEF5EE", color: "#2A5230" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#4A8A52" }}
            />
            Live
          </div>
          <h1
            className="font-extrabold text-3xl leading-tight"
            style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
          >
            Welcome back, Rae.
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "#7A9878" }}>
            Here&apos;s a snapshot of your learning platform today.
          </p>
        </div>

        {/* Sketch accent */}
        <div className="hidden md:block relative w-20 h-14 opacity-40">
          <svg viewBox="0 0 80 56" fill="none">
            <path d="M10 45 Q25 10 45 28 Q60 42 72 12" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="72" cy="12" r="3" fill="#C48A3A" />
            <circle cx="10" cy="45" r="2.5" fill="#2A5230" />
          </svg>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, href, accent, bg, icon, description }) => (
          <Link
            key={label}
            href={href}
            className="group relative rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: "#fff",
              border: "1.5px solid #E8EDE6",
              boxShadow: "0 2px 12px rgba(42,82,48,0.06)",
            }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full transition-all group-hover:left-3 group-hover:right-3"
              style={{ background: accent }}
            />

            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg, color: accent }}
              >
                {icon}
              </div>
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="currentColor"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: accent }}
              >
                <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.43l.carbón--.2.1m3.048-3.048a.75.75 0 0 1 0 1.06A3.5 3.5 0 0 0 7 12a3.5 3.5 0 0 0 5-4.95l2-2a3.5 3.5 0 0 1-5.396 4.43l-.1-.1" clipRule="evenodd" />
              </svg>
            </div>

            <div
              className="text-4xl font-extrabold mb-1 leading-none"
              style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
            >
              {value}
            </div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: "#2A5230" }}>
              {label}
            </div>
            <div className="text-xs" style={{ color: "#9AB89E" }}>
              {description}
            </div>
          </Link>
        ))}
      </div>

      {/* Two-col: recent courses + quick actions */}
      <div className="grid grid-cols-5 gap-5">
        {/* Recent courses */}
        <div
          className="col-span-3 rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1.5px solid #E8EDE6", boxShadow: "0 2px 12px rgba(42,82,48,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #F0F7F0" }}
          >
            <h2
              className="font-bold text-sm"
              style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
            >
              Recent Courses
            </h2>
            <Link
              href="/admin/courses"
              className="text-xs font-bold transition-colors"
              style={{ color: "#2A5230" }}
            >
              View all →
            </Link>
          </div>

          {!recentCourses || recentCourses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#EEF5EE" }}
              >
                <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" style={{ color: "#2A5230" }}>
                  <path d="M9 4.804A7.968 7.968 0 0 0 5.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 1 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 1 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804Z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "#2A5230" }}>No courses yet</p>
              <p className="text-xs mb-4" style={{ color: "#9AB89E" }}>Create your first course to get started</p>
              <Link
                href="/admin/courses/new"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                style={{ background: "#2A5230", color: "#fff" }}
              >
                Create First Course →
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#F5FAF5" }}>
              {recentCourses.map((c) => {
                const s = statusColor[c.status] ?? statusColor.draft;
                return (
                  <Link
                    key={c.id}
                    href={`/admin/courses/${c.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAFCFA] group"
                  >
                    {/* Initials avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                      style={{ background: "#EEF5EE", color: "#2A5230", fontFamily: "var(--font-head)" }}
                    >
                      {String(c.title)[0]?.toUpperCase() ?? "C"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "#1A2E1C" }}>
                        {c.title}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>
                        {levelLabel[c.level] ?? c.level} · {c.price_type}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                        style={{ background: s.bg, color: s.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                        {c.status}
                      </span>
                      <span
                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#7A9878" }}
                      >
                        Edit →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Create course card */}
          <Link
            href="/admin/courses/new"
            className="group rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #2A5230 0%, #1A3820 100%)",
              boxShadow: "0 4px 20px rgba(42,82,48,0.25)",
              minHeight: "140px",
            }}
          >
            <div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor" style={{ color: "#A8D4AC" }}>
                  <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm1 7V5.5H8V8H5.5v2H8v2.5h2V10h2.5V8H10Z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white mb-1">Create New Course</div>
              <div className="text-xs" style={{ color: "#7DAA82" }}>
                Build a course with modules, lessons, and rich content blocks
              </div>
            </div>
            <div className="text-xs font-bold mt-3" style={{ color: "#5A9E62" }}>
              Start building →
            </div>
          </Link>

          {/* Manage courses card */}
          <Link
            href="/admin/courses"
            className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: "#fff",
              border: "1.5px solid #E8EDE6",
              boxShadow: "0 2px 12px rgba(42,82,48,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "#F5F0E8" }}
            >
              <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.75 12h10.5M3.75 9h10.5M3.75 6h10.5" />
              </svg>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: "#1A2E1C" }}>Manage Courses</div>
            <div className="text-xs" style={{ color: "#9AB89E" }}>
              Edit, publish, reorder, or archive existing courses
            </div>
            <div className="text-xs font-bold mt-3" style={{ color: "#2A5230" }}>
              View all courses →
            </div>
          </Link>

          {/* Site preview */}
          <Link
            href="/"
            target="_blank"
            className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: "#FFF8E8",
              border: "1.5px solid #EAD9B5",
              boxShadow: "0 2px 12px rgba(196,138,58,0.08)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(196,138,58,0.12)" }}
            >
              <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#C48A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3.75a5.25 5.25 0 1 0 0 10.5A5.25 5.25 0 0 0 9 3.75Z" />
                <path d="M9 3.75c-1.5 0-2.625 2.318-2.625 5.25S7.5 14.25 9 14.25s2.625-2.318 2.625-5.25S10.5 3.75 9 3.75Z" />
                <path d="M3.75 9h10.5" />
              </svg>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: "#8A6020" }}>Preview Live Site</div>
            <div className="text-xs" style={{ color: "#B8965A" }}>
              Open the learner-facing site in a new tab
            </div>
            <div className="text-xs font-bold mt-3" style={{ color: "#C48A3A" }}>
              Open RaeLearn ↗
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom sketch decoration */}
      <div className="mt-10 flex items-center gap-3 opacity-25">
        <svg viewBox="0 0 200 12" width="200" height="12" fill="none">
          <path
            d="M2 7 Q50 2 100 6 Q150 10 198 5"
            stroke="#2A5230"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 3"
          />
        </svg>
        <span className="text-xs" style={{ fontFamily: "var(--font-hand)", color: "#2A5230" }}>
          RaeLearn Creator Studio
        </span>
        <svg viewBox="0 0 200 12" width="200" height="12" fill="none">
          <path
            d="M2 5 Q50 10 100 6 Q150 2 198 7"
            stroke="#2A5230"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 3"
          />
        </svg>
      </div>
    </div>
  );
}
