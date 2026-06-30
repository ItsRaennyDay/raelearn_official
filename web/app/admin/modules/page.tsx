import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("modules")
    .select(
      `id, title, description, sort_order, status, created_at,
       courses:course_id (id, title, slug)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) query = query.ilike("title", `%${q}%`);

  const { data: modules, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const STATUS_META: Record<string, { bg: string; text: string }> = {
    published: { bg: "#EEF5EE", text: "#2A5230" },
    draft:     { bg: "#FFF8E8", text: "#8A6020" },
    archived:  { bg: "#F3F3F3", text: "#666"    },
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
          Modules
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
          {count ?? 0} modules across all courses
        </p>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search module title…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>Search</button>
        {q && <Link href="/admin/modules" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>Clear</Link>}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Module</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Course</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Order</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!modules || modules.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>No modules found</td></tr>
            ) : (
              modules.map((m) => {
                const course = m.courses as unknown as { id?: string; title?: string; slug?: string } | null;
                const meta = STATUS_META[m.status ?? "draft"] ?? STATUS_META.draft;
                return (
                  <tr key={m.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: "#1A2E1C" }}>{m.title}</div>
                      {m.description && <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "#9AB89E" }}>{m.description}</div>}
                    </td>
                    <td className="px-5 py-3">
                      {course?.id ? (
                        <Link href={`/admin/courses/${course.id}`} className="text-sm hover:underline" style={{ color: "#2A5230" }}>
                          {course.title ?? "—"}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#7A9878" }}>#{m.sort_order}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize" style={{ background: meta.bg, color: meta.text }}>
                        {m.status ?? "draft"}
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
            {Number(page) > 1 && <Link href={`/admin/modules?q=${q}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>}
            {Number(page) < totalPages && <Link href={`/admin/modules?q=${q}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
