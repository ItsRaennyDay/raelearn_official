import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, max_uses, uses_count, valid_from, valid_until, applies_to, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) query = query.ilike("code", `%${q}%`);

  const { data: coupons, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const now = new Date();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Coupons
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {count ?? 0} discount codes
          </p>
        </div>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search coupon code…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Search
        </button>
        {q && (
          <Link href="/admin/coupons" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Code</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Discount</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Uses</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Applies To</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Valid Until</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!coupons || coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                  No coupons found
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const isExpired = c.valid_until && new Date(c.valid_until) < now;
                const isMaxed = c.max_uses && c.uses_count >= c.max_uses;
                const isActive = !isExpired && !isMaxed;

                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm font-bold" style={{ color: "#2A5230" }}>
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: "#1A2E1C" }}>
                      {c.discount_type === "percent"
                        ? `${c.discount_value}%`
                        : `₱${(c.discount_value / 100).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{ color: "#4A6650" }}>{c.uses_count ?? 0}</span>
                      {c.max_uses && (
                        <span style={{ color: "#9AB89E" }}> / {c.max_uses}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 capitalize text-xs" style={{ color: "#7A9878" }}>
                      {c.applies_to ?? "all"}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          background: isActive ? "#EEF5EE" : "#F3F3F3",
                          color: isActive ? "#2A5230" : "#777",
                        }}
                      >
                        {isActive ? "Active" : isExpired ? "Expired" : "Maxed"}
                      </span>
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
          <span className="text-xs" style={{ color: "#9AB89E" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link href={`/admin/coupons?q=${q}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/coupons?q=${q}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
