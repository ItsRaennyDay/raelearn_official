import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("organizations")
    .select(
      "id, name, slug, seat_count, seats_used, subscription_expires_at, created_at, profiles:owner_id (full_name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: orgs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Organizations
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {count ?? 0} organizations
          </p>
        </div>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search organization name…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Search
        </button>
        {q && (
          <Link href="/admin/organizations" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Organization</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Owner</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Seats</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Subscription</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {!orgs || orgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                  No organizations found
                </td>
              </tr>
            ) : (
              orgs.map((org) => {
                const owner = org.profiles as unknown as { full_name?: string; email?: string } | null;
                const seatsUsed = org.seats_used ?? 0;
                const seatCount = org.seat_count ?? 0;
                const seatPct = seatCount > 0 ? Math.round((seatsUsed / seatCount) * 100) : 0;
                const isExpired = org.subscription_expires_at && new Date(org.subscription_expires_at) < new Date();

                return (
                  <tr key={org.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: "#1A2E1C" }}>{org.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{org.slug}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div style={{ color: "#4A6650" }}>{owner?.full_name ?? "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{owner?.email ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-semibold" style={{ color: "#2A5230" }}>
                        {seatsUsed} / {seatCount}
                      </div>
                      <div className="w-24 h-1.5 rounded-full mt-1" style={{ background: "#EEF5EE" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${seatPct}%`, background: seatPct > 90 ? "#C48A3A" : "#4A8A52" }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {org.subscription_expires_at ? (
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            background: isExpired ? "#FFF0F0" : "#EEF5EE",
                            color: isExpired ? "#AA2222" : "#2A5230",
                          }}
                        >
                          {isExpired ? "Expired" : `Exp. ${new Date(org.subscription_expires_at).toLocaleDateString()}`}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#9AB89E" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
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
              <Link href={`/admin/organizations?q=${q}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/organizations?q=${q}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
