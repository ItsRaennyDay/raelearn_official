import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const ROLE_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  platform_admin:  { label: "Platform Admin",  bg: "#EEE8FF", text: "#5A3FA0", dot: "#7B5EA7" },
  content_admin:   { label: "Content Admin",   bg: "#E8F5EE", text: "#2A5230", dot: "#4A8A52" },
  group_admin:     { label: "Group Admin",     bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  group_learner:   { label: "Group Learner",   bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
  learner:         { label: "Learner",         bg: "#F3F3F3", text: "#555",    dot: "#999"    },
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const { q = "", role = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (role) {
    query = query.eq("role", role);
  }

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Users
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {count ?? 0} registered accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none focus:ring-2"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <select
          name="role"
          defaultValue={role}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        >
          <option value="">All roles</option>
          <option value="learner">Learner</option>
          <option value="group_learner">Group Learner</option>
          <option value="group_admin">Group Admin</option>
          <option value="content_admin">Content Admin</option>
          <option value="platform_admin">Platform Admin</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Search
        </button>
        {(q || role) && (
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm rounded-xl"
            style={{ background: "#F5F0E8", color: "#7A9878" }}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>User</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Email</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Role</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {!users || users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const meta = ROLE_META[u.role] ?? ROLE_META.learner;
                const initials = (u.full_name ?? u.email ?? "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <tr key={u.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "#EEF5EE", color: "#2A5230" }}
                        >
                          {initials}
                        </div>
                        <span className="font-medium" style={{ color: "#1A2E1C" }}>
                          {u.full_name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#4A6650" }}>{u.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "#9AB89E" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link
                href={`/admin/users?q=${q}&role=${role}&page=${Number(page) - 1}`}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}
              >
                ← Prev
              </Link>
            )}
            {Number(page) < totalPages && (
              <Link
                href={`/admin/users?q=${q}&role=${role}&page=${Number(page) + 1}`}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}
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
