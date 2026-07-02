import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOverviewPage() {
  const db = createAdminClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: openTickets,    count: openTicketCount },
    { data: recentEnrolls },
    { data: recentUsers },
    { count: draftCount },
    { data: activeEnrollUserIds },
    { count: subscriberCount },
  ] = await Promise.all([
    db.from("support_tickets")
      .select("id, ticket_id, subject, submitter_name, priority, created_at", { count: "exact" })
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(4),
    db.from("enrollments")
      .select("id, enrolled_at, source, profiles:user_id(full_name, email), courses:course_id(title)")
      .order("enrolled_at", { ascending: false })
      .limit(6),
    db.from("profiles")
      .select("id, full_name, email, created_at")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5),
    db.from("courses").select("*", { count: "exact", head: true }).eq("status", "draft"),
    // Fetched (not head:true) so we can dedupe by user — "Active Learners" counts
    // people, not enrollment rows, so someone enrolled in 3 courses counts once.
    db.from("enrollments").select("user_id").eq("status", "active"),
    db.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "subscribed"),
  ]);

  const activeLearnerCount = new Set((activeEnrollUserIds ?? []).map((e) => e.user_id)).size;

  const PRIORITY_COLOR: Record<string, { bg: string; text: string }> = {
    urgent: { bg: "#FFF0F0", text: "#AA2222" },
    high:   { bg: "#FFF3DC", text: "#8A6020" },
    normal: { bg: "#EEF5EE", text: "#2A5230" },
    low:    { bg: "#F3F3F3", text: "#666"    },
  };

  const quickActions = [
    { label: "New Course",      href: "/admin/courses/new",    icon: "M12 4.5v15m7.5-7.5h-15", color: "#2A5230", bg: "#EEF5EE" },
    { label: "Enroll Learner",  href: "/admin/enrollments",    icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z", color: "#6B4FBB", bg: "#F0ECFF" },
    { label: "View Support",    href: "/admin/support",        icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75", color: "#B86B4A", bg: "#FFF3EE" },
    { label: "Manage Users",    href: "/admin/users",          icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z", color: "#1A6B6B", bg: "#E8F5F5" },
    { label: "View Reports",    href: "/admin/reports",        icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z", color: "var(--admin-text-muted)", bg: "#F0F5F1" },
    { label: "Quiz Builder",    href: "/admin/quizzes",        icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z", color: "#8A6020", bg: "#FFF8E8" },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-4 md:p-8 max-w-6xl space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--admin-text-dim)" }}>{dateStr}</p>
        <h1 className="font-extrabold text-2xl leading-tight" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
          {greeting}, Rae
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Here&apos;s what needs your attention today.</p>
      </div>

      {/* At-a-glance tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Link href="/admin/support?status=open"
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: (openTicketCount ?? 0) > 0 ? "#FFF0F0" : "#fff", border: `1.5px solid ${(openTicketCount ?? 0) > 0 ? "#FFCCCC" : "#E8EDE6"}` }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: (openTicketCount ?? 0) > 0 ? "#AA2222" : "#9AB89E" }}>Open Tickets</span>
            {(openTicketCount ?? 0) > 0 && (
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#AA2222" }} />
            )}
          </div>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: (openTicketCount ?? 0) > 0 ? "#AA2222" : "#1A2E1C" }}>
            {openTicketCount ?? 0}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-dim)" }}>needs reply →</div>
        </Link>

        <Link href="/admin/courses?status=draft"
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--admin-text-dim)" }}>Draft Courses</span>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            {draftCount ?? 0}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-dim)" }}>ready to publish →</div>
        </Link>

        <Link href="/admin/enrollments"
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--admin-text-dim)" }}>Active Learners</span>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            {activeLearnerCount}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-dim)" }}>enrolled & active →</div>
        </Link>

        <Link href="/admin/users"
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--admin-text-dim)" }}>New This Week</span>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            {recentUsers?.length ?? 0}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-dim)" }}>new signups →</div>
        </Link>

        <Link href="/admin/newsletter"
          className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--admin-text-dim)" }}>Subscribers</span>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            {subscriberCount ?? 0}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-dim)" }}>newsletter list →</div>
        </Link>
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Enrollments — 2 cols wide */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--admin-border)" }}>
            <h2 className="font-bold text-sm" style={{ color: "var(--admin-text-primary)" }}>Recent Enrollments</h2>
            <Link href="/admin/enrollments" className="text-xs font-bold" style={{ color: "var(--admin-accent)" }}>View all →</Link>
          </div>

          {!recentEnrolls?.length ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No enrollments yet.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
              {recentEnrolls.map((e) => {
                const profile = e.profiles as { full_name?: string; email?: string } | null;
                const course  = e.courses  as { title?: string } | null;
                const initials = profile?.full_name
                  ? profile.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                  : (profile?.email?.[0]?.toUpperCase() ?? "?");
                const timeAgo  = e.enrolled_at ? timeAgoStr(e.enrolled_at) : "—";
                return (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFCFA] transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                      style={{ background: "#EEF5EE", color: "#2A5230" }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--admin-text-primary)" }}>
                        {profile?.full_name || profile?.email?.split("@")[0] || "Unknown"}
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--admin-text-dim)" }}>
                        enrolled in <span style={{ color: "var(--admin-text-muted)" }}>{course?.title ?? "—"}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px]" style={{ color: "#B8D4B5" }}>{timeAgo}</div>
                      {e.source && (
                        <div className="text-[10px] capitalize mt-0.5" style={{ color: "#C8DEC8" }}>{e.source.replace("_", " ")}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Open tickets */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--admin-border)" }}>
              <h2 className="font-bold text-sm" style={{ color: "var(--admin-text-primary)" }}>Open Tickets</h2>
              <Link href="/admin/support" className="text-xs font-bold" style={{ color: "var(--admin-accent)" }}>View all →</Link>
            </div>

            {!openTickets?.length ? (
              <div className="px-5 py-6 text-center text-xs" style={{ color: "var(--admin-text-dim)" }}>
                All caught up! No open tickets.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {openTickets.map((t) => {
                  const p = PRIORITY_COLOR[t.priority ?? "normal"] ?? PRIORITY_COLOR.normal;
                  return (
                    <Link key={t.id} href={`/admin/support/${t.id}`}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-[#FAFCFA] transition-colors">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.text }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--admin-text-primary)" }}>{t.subject}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
                          {t.ticket_id} · {t.submitter_name ?? "Anonymous"}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize" style={{ background: p.bg, color: p.text }}>
                        {t.priority ?? "normal"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <h2 className="font-bold text-sm mb-3" style={{ color: "var(--admin-text-primary)" }}>Quick Actions</h2>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, href, icon, color, bg }) => (
                <Link key={label} href={href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:-translate-y-0.5"
                  style={{ background: bg, textDecoration: "none" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold leading-tight" style={{ color }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* New signups strip */}
      {(recentUsers?.length ?? 0) > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: "var(--admin-text-primary)" }}>New Signups This Week</h2>
            <Link href="/admin/users" className="text-xs font-bold" style={{ color: "var(--admin-accent)" }}>View all →</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentUsers!.map((u) => {
              const initials = u.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? "?";
              return (
                <div key={u.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: "var(--admin-table-head-bg)", border: "1px solid #EEF5EE" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                    style={{ background: "#EEF5EE", color: "#2A5230" }}>
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--admin-text-primary)" }}>{u.full_name ?? "—"}</div>
                    <div className="text-[10px]" style={{ color: "var(--admin-text-dim)" }}>{u.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

function timeAgoStr(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
