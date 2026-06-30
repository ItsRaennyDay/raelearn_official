import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const TYPE_META: Record<string, { label: string; bg: string; text: string }> = {
  video:      { label: "Video",      bg: "#E8F2FF", text: "#1A4A8A" },
  text:       { label: "Text",       bg: "#EEF5EE", text: "#2A5230" },
  quiz:       { label: "Quiz",       bg: "#FFF3DC", text: "#8A6020" },
  assignment: { label: "Assignment", bg: "#F5E8FF", text: "#6A2A8A" },
  download:   { label: "Download",   bg: "#F3F3F3", text: "#555"    },
};

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { q = "", type = "", page = "1" } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  let query = db
    .from("lessons")
    .select(
      `id, title, lesson_type, duration_mins, is_required, sort_order, status, created_at,
       modules:module_id (id, title, courses:course_id (id, title))`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) query = query.ilike("title", `%${q}%`);
  if (type) query = query.eq("lesson_type", type);

  const { data: lessons, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Lessons</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{count ?? 0} lessons total</p>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input name="q" defaultValue={q} placeholder="Search lesson title…" className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none" style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }} />
        <select name="type" defaultValue={type} className="px-3 py-2 text-sm rounded-xl border outline-none" style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}>
          <option value="">All types</option>
          <option value="video">Video</option>
          <option value="text">Text</option>
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
          <option value="download">Download</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>Filter</button>
        {(q || type) && <Link href="/admin/lessons" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>Clear</Link>}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Lesson</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Type</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Module / Course</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Duration</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {!lessons || lessons.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>No lessons found</td></tr>
            ) : (
              lessons.map((l) => {
                const mod = l.modules as unknown as { id?: string; title?: string; courses?: { id?: string; title?: string } | null } | null;
                const course = mod?.courses ?? null;
                const typeMeta = TYPE_META[l.lesson_type] ?? { label: l.lesson_type, bg: "#F3F3F3", text: "#555" };
                return (
                  <tr key={l.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3 font-medium" style={{ color: "#1A2E1C" }}>{l.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: typeMeta.bg, color: typeMeta.text }}>{typeMeta.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#7A9878" }}>
                      <div>{mod?.title ?? "—"}</div>
                      <div style={{ color: "#9AB89E" }}>{course?.title ?? ""}</div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {l.duration_mins ? `${l.duration_mins}m` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: l.status === "published" ? "#EEF5EE" : "#FFF8E8", color: l.status === "published" ? "#2A5230" : "#8A6020" }}>
                        {l.status ?? "draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {course?.id && mod?.id ? (
                        <Link href={`/admin/courses/${course.id}/lessons/${l.id}`} className="text-xs font-bold" style={{ color: "#2A5230" }}>
                          Edit →
                        </Link>
                      ) : "—"}
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
            {Number(page) > 1 && <Link href={`/admin/lessons?q=${q}&type=${type}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>}
            {Number(page) < totalPages && <Link href={`/admin/lessons?q=${q}&type=${type}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
