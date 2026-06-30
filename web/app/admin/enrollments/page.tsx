import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const STATUS_META: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  expired:   { bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  cancelled: { bg: "#F3F3F3", text: "#666",    dot: "#999"    },
  completed: { bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
};

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("enrollments")
    .select(
      `id, status, enrolled_at, completed_at, source,
       profiles:user_id (full_name, email),
       courses:course_id (title, slug)`,
      { count: "exact" }
    )
    .order("enrolled_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status) query = query.eq("status", status);

  const { data: enrollments, count } = await query;

  const filtered = q
    ? (enrollments ?? []).filter((e) => {
        const profile = e.profiles as unknown as { full_name?: string; email?: string } | null;
        const course = e.courses as unknown as { title?: string } | null;
        const search = q.toLowerCase();
        return (
          profile?.full_name?.toLowerCase().includes(search) ||
          profile?.email?.toLowerCase().includes(search) ||
          course?.title?.toLowerCase().includes(search)
        );
      })
    : (enrollments ?? []);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Enrollments
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {count ?? 0} total enrollments
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search learner or course…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Filter
        </button>
        {(q || status) && (
          <Link href="/admin/enrollments" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Learner</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Course</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Source</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                  No enrollments found
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const profile = e.profiles as unknown as { full_name?: string; email?: string } | null;
                const course = e.courses as unknown as { title?: string; slug?: string } | null;
                const meta = STATUS_META[e.status] ?? STATUS_META.active;
                return (
                  <tr key={e.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: "#1A2E1C" }}>{profile?.full_name ?? "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{profile?.email ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#4A6650" }}>
                      {course?.slug ? (
                        <Link href={`/courses/${course.slug}`} className="hover:underline">
                          {course.title ?? "—"}
                        </Link>
                      ) : (course?.title ?? "—")}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs capitalize" style={{ color: "#7A9878" }}>
                      {e.source ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}
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
              <Link href={`/admin/enrollments?status=${status}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/enrollments?status=${status}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
