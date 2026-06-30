import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

async function createCoupon(formData: FormData) {
  "use server";
  await verifyAdmin();

  const raw = {
    code:           (formData.get("code") as string ?? "").trim().toUpperCase(),
    discount_type:  formData.get("discount_type") as string,
    discount_value: formData.get("discount_value") as string,
    max_uses:       formData.get("max_uses") as string,
    valid_from:     formData.get("valid_from") as string,
    valid_until:    formData.get("valid_until") as string,
    applies_to:     formData.get("applies_to") as string,
  };

  // Sanitize: code must be alphanumeric + dash
  if (!/^[A-Z0-9_-]{2,32}$/.test(raw.code)) {
    redirect("/admin/coupons?error=invalid-code");
  }

  const discountValue = parseFloat(raw.discount_value);
  if (isNaN(discountValue) || discountValue <= 0) {
    redirect("/admin/coupons?error=invalid-value");
  }
  if (raw.discount_type === "percent" && discountValue > 100) {
    redirect("/admin/coupons?error=invalid-percent");
  }

  const db = createAdminClient();

  // Check code uniqueness
  const { data: existing } = await db.from("coupons").select("id").eq("code", raw.code).single();
  if (existing) redirect("/admin/coupons?error=code-taken");

  await db.from("coupons").insert({
    code:           raw.code,
    discount_type:  raw.discount_type,
    discount_value: raw.discount_type === "fixed" ? Math.round(discountValue * 100) : discountValue,
    max_uses:       raw.max_uses ? parseInt(raw.max_uses) : null,
    uses_count:     0,
    valid_from:     raw.valid_from || null,
    valid_until:    raw.valid_until || null,
    applies_to:     raw.applies_to || "all",
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?created=1");
}

async function deleteCoupon(formData: FormData) {
  "use server";
  await verifyAdmin();
  const couponId = formData.get("couponId") as string;
  if (!couponId) return;
  const db = createAdminClient();
  await db.from("coupons").delete().eq("id", couponId);
  revalidatePath("/admin/coupons");
}

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-code":    "Code must be 2–32 characters, letters, numbers, dashes only.",
  "invalid-value":   "Discount value must be a positive number.",
  "invalid-percent": "Percentage discount cannot exceed 100%.",
  "code-taken":      "That coupon code already exists.",
};

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; created?: string; error?: string }>;
}) {
  const { q = "", page = "1", created, error } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("coupons")
    .select("id, code, discount_type, discount_value, max_uses, uses_count, valid_from, valid_until, applies_to, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) query = query.ilike("code", `%${q}%`);

  const { data: coupons, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);
  const now = new Date();

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Coupons</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{count ?? 0} discount codes</p>
      </div>

      {/* Feedback banners */}
      {created && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Coupon created successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          {ERROR_MESSAGES[error] ?? decodeURIComponent(error)}
        </div>
      )}

      {/* Create coupon panel */}
      <div className="mb-6 rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <h2 className="font-bold text-sm mb-4" style={{ color: "#2A5230" }}>Create New Coupon</h2>
        <form action={createCoupon}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>
                Coupon Code <span style={{ color: "#AA2222" }}>*</span>
              </label>
              <input
                name="code"
                type="text"
                required
                placeholder="SUMMER25"
                maxLength={32}
                className="px-4 py-2 text-sm rounded-xl border outline-none font-mono uppercase"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
              <span className="text-xs" style={{ color: "#9AB89E" }}>Letters, numbers, dashes. Auto-uppercased.</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Applies To</label>
              <select
                name="applies_to"
                className="px-3 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              >
                <option value="all">All courses</option>
                <option value="course">Specific course</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>
                Discount Type <span style={{ color: "#AA2222" }}>*</span>
              </label>
              <select
                name="discount_type"
                required
                className="px-3 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount (₱)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>
                Discount Value <span style={{ color: "#AA2222" }}>*</span>
              </label>
              <input
                name="discount_value"
                type="number"
                required
                min="1"
                max="100000"
                step="0.01"
                placeholder="20"
                className="px-4 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
              <span className="text-xs" style={{ color: "#9AB89E" }}>For percent: 1–100. For fixed: amount in ₱.</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Max Uses</label>
              <input
                name="max_uses"
                type="number"
                min="1"
                placeholder="Unlimited"
                className="px-4 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
              <span className="text-xs" style={{ color: "#9AB89E" }}>Leave blank for unlimited uses.</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Valid From</label>
              <input
                name="valid_from"
                type="date"
                className="px-4 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Expiration Date</label>
              <input
                name="valid_until"
                type="date"
                className="px-4 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
              <span className="text-xs" style={{ color: "#9AB89E" }}>Leave blank for no expiry.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold rounded-xl"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search coupon code…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>Search</button>
        {q && <Link href="/admin/coupons" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>Clear</Link>}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Code</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Discount</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Uses</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Applies To</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Valid</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {!coupons || coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                  No coupons yet. Create one above.
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const isExpired = c.valid_until && new Date(c.valid_until) < now;
                const isMaxed = c.max_uses != null && (c.uses_count ?? 0) >= c.max_uses;
                const isActive = !isExpired && !isMaxed;

                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm font-bold" style={{ color: "#2A5230" }}>{c.code}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: "#1A2E1C" }}>
                      {c.discount_type === "percent"
                        ? `${c.discount_value}%`
                        : `₱${((c.discount_value ?? 0) / 100).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{ color: "#4A6650" }}>{c.uses_count ?? 0}</span>
                      {c.max_uses != null && <span style={{ color: "#9AB89E" }}> / {c.max_uses}</span>}
                    </td>
                    <td className="px-5 py-3 capitalize text-xs" style={{ color: "#7A9878" }}>{c.applies_to ?? "all"}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {c.valid_from && <span>{new Date(c.valid_from).toLocaleDateString()} – </span>}
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
                        {isActive ? "Active" : isExpired ? "Expired" : "Maxed out"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <form action={deleteCoupon}>
                        <input type="hidden" name="couponId" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs font-bold px-3 py-1 rounded-lg"
                          style={{ background: "#FFF0F0", color: "#AA2222" }}
                        >
                          Delete
                        </button>
                      </form>
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
