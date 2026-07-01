import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const STATUS_META: Record<string, { bg: string; text: string; dot: string }> = {
  pending:   { bg: "#FFF8E8", text: "#8A6020", dot: "#C48A3A" },
  paid:      { bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  failed:    { bg: "#FFF0F0", text: "#AA2222", dot: "#CC4444" },
  refunded:  { bg: "#F3F3F3", text: "#555",    dot: "#999"    },
  cancelled: { bg: "#F3F3F3", text: "#555",    dot: "#999"    },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("orders")
    .select(
      `id, status, total_cents, subtotal_cents, discount_cents, created_at, notes,
       profiles:user_id (full_name, email)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status) query = query.eq("status", status);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const totalRevenue = (orders ?? [])
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (o.total_cents ?? 0), 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            Orders
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
            {count ?? 0} orders · ₱{(totalRevenue / 100).toLocaleString()} revenue (this page)
          </p>
        </div>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-card-bg)", color: "var(--admin-text-primary)" }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Filter
        </button>
        {status && (
          <Link href="/admin/orders" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "var(--admin-text-muted)" }}>
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Order ID</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Customer</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Status</th>
              <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Total</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const profile = o.profiles as unknown as { full_name?: string; email?: string } | null;
                const meta = STATUS_META[o.status] ?? STATUS_META.pending;
                return (
                  <tr key={o.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: "var(--admin-text-primary)" }}>{profile?.full_name ?? "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{profile?.email ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--admin-accent)" }}>
                      ₱{((o.total_cents ?? 0) / 100).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--admin-text-dim)" }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "var(--admin-text-dim)" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link href={`/admin/orders?status=${status}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/orders?status=${status}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
