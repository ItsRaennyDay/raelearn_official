import { createAdminClient } from "@/lib/supabase/admin";

export default async function ReportsPage() {
  const db = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalEnrollments },
    { count: activeEnrollments },
    { count: completedEnrollments },
    { count: totalOrders },
    { data: paidOrders },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("enrollments").select("*", { count: "exact", head: true }),
    db.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    db.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "completed"),
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("total_cents").eq("status", "paid"),
  ]);

  const totalRevenue = (paidOrders ?? []).reduce((sum, o) => sum + (o.total_cents ?? 0), 0);

  const metrics = [
    { label: "Total Users", value: totalUsers ?? 0, accent: "#2A5230", bg: "#EEF5EE" },
    { label: "Total Enrollments", value: totalEnrollments ?? 0, accent: "#6B4FBB", bg: "#F0ECFF" },
    { label: "Active Enrollments", value: activeEnrollments ?? 0, accent: "#1A4A8A", bg: "#E8F2FF" },
    { label: "Completions", value: completedEnrollments ?? 0, accent: "#2A7A5A", bg: "#E8FFF5" },
    { label: "Total Orders", value: totalOrders ?? 0, accent: "#8A6020", bg: "#FFF3DC" },
    { label: "Total Revenue", value: `₱${(totalRevenue / 100).toLocaleString()}`, accent: "#AA2255", bg: "#FFE8F0" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Platform-wide analytics snapshot</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div
              className="text-3xl font-extrabold mb-1"
              style={{ fontFamily: "var(--font-head)", color: m.accent }}
            >
              {m.value}
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--admin-text-muted)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-10 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 20V12M7 20V8M11 20V10M15 20V4M19 20V6" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Advanced Analytics</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--admin-text-muted)" }}>
          Charts, cohort analysis, revenue trends, and CSV export are coming soon. The metrics above reflect real-time platform data.
        </p>
      </div>
    </div>
  );
}
