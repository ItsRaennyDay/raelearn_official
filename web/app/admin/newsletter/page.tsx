import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const db = createAdminClient();

  const [{ count: total }, { count: footerCount }, { count: exitCount }, { data: subscribers }] = await Promise.all([
    db.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "subscribed"),
    db.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "subscribed").eq("source", "footer"),
    db.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "subscribed").eq("source", "exit_intent"),
    db.from("newsletter_subscribers")
      .select("id, name, email, source, status, subscribed_at")
      .order("subscribed_at", { ascending: false })
      .limit(500),
  ]);

  const filtered = q
    ? (subscribers ?? []).filter((s) => {
        const term = q.toLowerCase();
        return s.name?.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
      })
    : (subscribers ?? []);

  const stats = [
    { label: "Subscribed",  value: total ?? 0,       color: "var(--admin-accent)" },
    { label: "From Footer", value: footerCount ?? 0, color: "#6B4FBB" },
    { label: "From Popup",  value: exitCount ?? 0,   color: "#8A6020" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Newsletter Subscribers</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Captured from the site footer and the exit-intent popup</p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="px-4 py-2.5 text-sm font-bold rounded-xl"
          style={{ background: "var(--admin-card-bg)", color: "var(--admin-accent)", border: "1.5px solid var(--admin-border)" }}
        >
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <form method="GET" className="flex flex-wrap gap-3 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-card-bg)", color: "var(--admin-text-primary)" }}
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>Search</button>
        {q && <Link href="/admin/newsletter" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "var(--admin-text-muted)" }}>Clear</Link>}
      </form>

      <div className="overflow-x-auto rounded-2xl" style={{ border: "1.5px solid var(--admin-border)" }}>
        <div style={{ background: "var(--admin-card-bg)", minWidth: "600px" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                {["Name", "Email", "Source", "Status", "Subscribed"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>
                    {q ? "No subscribers match your search." : "No subscribers yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}>
                    <td className="px-5 py-3" style={{ color: "var(--admin-text-primary)" }}>{s.name || "—"}</td>
                    <td className="px-5 py-3" style={{ color: "var(--admin-text-muted)" }}>{s.email}</td>
                    <td className="px-5 py-3 text-xs capitalize" style={{ color: "var(--admin-text-muted)" }}>{s.source?.replace("_", " ") ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                        style={s.status === "subscribed" ? { background: "#EEF5EE", color: "#2A5230" } : { background: "#F3F3F3", color: "#888" }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--admin-text-dim)" }}>
                      {new Date(s.subscribed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
