import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  create:   { bg: "#EEF5EE", text: "#2A5230" },
  update:   { bg: "#FFF8E8", text: "#8A6020" },
  delete:   { bg: "#FFF0F0", text: "#AA2222" },
  enroll:   { bg: "#E8F2FF", text: "#1A4A8A" },
  revoke:   { bg: "#FFF3DC", text: "#8A6020" },
  invite:   { bg: "#F0ECFF", text: "#6B4FBB" },
  role_change: { bg: "#F0ECFF", text: "#6B4FBB" },
  signin:   { bg: "#EEF5EE", text: "#2A5230" },
  signout:  { bg: "#F3F3F3", text: "#666" },
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.startsWith(k));
  return key ? ACTION_COLORS[key] : { bg: "#F3F3F3", text: "#555" };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; table?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");

  const { action = "", table = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("audit_logs")
    .select(
      `id, action, table_name, record_id, old_values, new_values,
       ip_address, user_agent, created_at,
       profiles:actor_id (full_name, email)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (action) query = query.ilike("action", `%${action}%`);
  if (table)  query = query.eq("table_name", table);

  const { data: logs, count } = await query;

  // Distinct table names for filter dropdown
  const { data: tables } = await db
    .from("audit_logs")
    .select("table_name")
    .order("table_name");
  const tableNames = [...new Set((tables ?? []).map((r) => r.table_name))];

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
          Audit Logs
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          Platform activity and security event trail
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-5">
        <input
          name="action"
          defaultValue={action}
          placeholder="Filter by action…"
          className="flex-1 min-w-[160px] px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-card-bg)", color: "var(--admin-text-primary)" }}
        />
        <select
          name="table"
          defaultValue={table}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-card-bg)", color: "var(--admin-text-primary)" }}
        >
          <option value="">All tables</option>
          {tableNames.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Filter
        </button>
        {(action || table) && (
          <Link
            href="/admin/audit-logs"
            className="px-4 py-2 text-sm rounded-xl"
            style={{ background: "#F5F0E8", color: "var(--admin-text-muted)" }}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Stats */}
      <div className="text-xs mb-4" style={{ color: "var(--admin-text-dim)" }}>
        {count ?? 0} total events{" "}
        {(action || table) && <span>· filtered</span>}
      </div>

      {!logs || logs.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--admin-card-bg)", border: "1.5px dashed #C8DEC8" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#EEF5EE" }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-4" />
              <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <h2 className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            No events yet
          </h2>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>
            Admin actions like enrollments, role changes, and content edits will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1.5px solid var(--admin-border)" }}>
          <div style={{ background: "var(--admin-card-bg)", minWidth: "680px" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Actor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Action</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Table</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const profile = log.profiles as unknown as { full_name?: string; email?: string } | null;
                  const color = actionColor(log.action);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#FAFCFA] transition-colors"
                      style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}
                    >
                      <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: "var(--admin-text-dim)" }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        {profile ? (
                          <div>
                            <div className="text-xs font-medium" style={{ color: "var(--admin-text-primary)" }}>
                              {profile.full_name ?? profile.email ?? "—"}
                            </div>
                            {profile.full_name && (
                              <div className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>{profile.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--admin-text-dim)" }}>System</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono" style={{ color: "var(--admin-text-muted)" }}>
                          {log.table_name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--admin-text-dim)" }}>
                        {log.record_id ? log.record_id.slice(0, 8) + "…" : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "var(--admin-text-dim)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link
                href={`/admin/audit-logs?action=${action}&table=${table}&page=${Number(page) - 1}`}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)", color: "#2A5230" }}
              >
                ← Prev
              </Link>
            )}
            {Number(page) < totalPages && (
              <Link
                href={`/admin/audit-logs?action=${action}&table=${table}&page=${Number(page) + 1}`}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)", color: "#2A5230" }}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
