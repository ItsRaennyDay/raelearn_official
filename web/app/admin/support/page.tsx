import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:        { label: "Open",        bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  in_progress: { label: "In Progress", bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
  resolved:    { label: "Resolved",    bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  closed:      { label: "Closed",      bg: "#F3F3F3", text: "#666",    dot: "#999"    },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#9AB89E" },
  normal: { label: "Normal", color: "#7A9878" },
  high:   { label: "High",   color: "#C48A3A" },
  urgent: { label: "Urgent", color: "#AA2222" },
};

const CATEGORY_LABELS: Record<string, string> = {
  general:         "General",
  course_help:     "Course Help",
  billing:         "Billing",
  group_account:   "Group Account",
  custom_training: "Custom Training",
  other:           "Other",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; page?: string; q?: string }>;
}) {
  await verifyAdmin();
  const { status = "", priority = "", page = "1", q = "" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 30;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("support_tickets")
    .select("id, ticket_id, submitter_name, email, subject, category, status, priority, created_at, resolved_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status)   query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data: tickets, count } = await query;

  const filtered = q
    ? (tickets ?? []).filter((t) => {
        const s = q.toLowerCase();
        return (
          t.ticket_id?.toLowerCase().includes(s) ||
          t.email?.toLowerCase().includes(s) ||
          (t.submitter_name ?? "").toLowerCase().includes(s) ||
          t.subject?.toLowerCase().includes(s)
        );
      })
    : (tickets ?? []);

  const openCount = count ?? 0;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Support Inbox</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{openCount} tickets total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["open","in_progress","resolved","closed"] as const).map((s) => {
            const m = STATUS_META[s];
            return (
              <Link
                key={s}
                href={`/admin/support?status=${s}`}
                className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                style={status === s
                  ? { background: m.bg, color: m.text, borderColor: "transparent" }
                  : { background: "#fff", color: "#7A9878", borderColor: "#DDE8DA" }
                }
              >
                {m.label}
              </Link>
            );
          })}
          {status && (
            <Link href="/admin/support" className="text-xs px-3 py-1.5 rounded-full border" style={{ background: "#F5F0E8", color: "#7A9878", borderColor: "transparent" }}>
              Clear
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 mb-5 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search ticket ID, email, or subject…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Search
        </button>
        {q && (
          <Link href={`/admin/support?status=${status}`} className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
            Clear
          </Link>
        )}
      </form>

      {/* Ticket list */}
      <div className="overflow-x-auto rounded-2xl" style={{ border: "1.5px solid #E8EDE6" }}>
        <div style={{ background: "#fff", minWidth: "640px" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Ticket</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>From</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Category</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Priority</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-sm" style={{ color: "#9AB89E" }}>
                    No tickets found
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const sm = STATUS_META[t.status]   ?? STATUS_META.open;
                  const pm = PRIORITY_META[t.priority ?? "normal"] ?? PRIORITY_META.normal;
                  return (
                    <tr key={t.id} className="hover:bg-[#FAFCFA] transition-colors" style={{ borderBottom: "1px solid #F5FAF5" }}>
                      <td className="px-5 py-3">
                        <div className="font-bold text-xs" style={{ color: "#2A5230" }}>{t.ticket_id ?? "—"}</div>
                        <div className="text-[11px] mt-0.5 max-w-[200px] truncate" style={{ color: "#4A6650" }}>{t.subject}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-[13px]" style={{ color: "#1A2E1C" }}>{t.submitter_name ?? "—"}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{t.email}</div>
                      </td>
                      <td className="px-5 py-3 text-xs capitalize" style={{ color: "#7A9878" }}>
                        {CATEGORY_LABELS[t.category ?? "general"] ?? t.category}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.text }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sm.dot }} />
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-bold" style={{ color: pm.color }}>
                        {pm.label}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: "#EEF5EE", color: "#2A5230" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "#9AB89E" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link href={`/admin/support?status=${status}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/support?status=${status}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
