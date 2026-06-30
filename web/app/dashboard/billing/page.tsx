import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, created_at, order_items(courses(title))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const STATUS_META: Record<string, { bg: string; text: string }> = {
    paid:      { bg: "#EEF5EE", text: "#2A5230" },
    pending:   { bg: "#FFF8E8", text: "#8A6020" },
    failed:    { bg: "#FFF0F0", text: "#AA2222" },
    refunded:  { bg: "#F3F3F3", text: "#555"    },
    cancelled: { bg: "#F3F3F3", text: "#555"    },
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Billing & Purchases</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Your order history</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <p className="text-sm" style={{ color: "#9AB89E" }}>No purchases yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A9878" }}>Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A9878" }}>Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A9878" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const meta = STATUS_META[o.status] ?? STATUS_META.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "#7A9878" }}>{o.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize" style={{ background: meta.bg, color: meta.text }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: "#2A5230" }}>
                      ₱{((o.total_cents ?? 0) / 100).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
