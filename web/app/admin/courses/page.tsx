import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  published: { bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  draft:     { bg: "#FFF8E8", text: "#8A6020", dot: "#C48A3A" },
  archived:  { bg: "#F3F3F3", text: "#666",    dot: "#999" },
};

const levelStyle: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: "#EEF5EE", text: "#2A5230" },
  intermediate: { bg: "#F0ECFF", text: "#6B4FBB" },
  advanced:     { bg: "#FFF0EC", text: "#B86B4A" },
};

const priceStyle: Record<string, { bg: string; text: string }> = {
  free: { bg: "#EEF5EE", text: "#2A5230" },
  paid: { bg: "#FFF8E8", text: "#8A6020" },
};

export default async function AdminCoursesPage() {
  const db = createAdminClient();
  const { data: courses } = await db
    .from("courses")
    .select("id, title, slug, level, price_type, status, created_at, certificate_eligible")
    .order("created_at", { ascending: false });

  const publishedCount = courses?.filter((c) => c.status === "published").length ?? 0;
  const draftCount     = courses?.filter((c) => c.status === "draft").length ?? 0;
  const total          = courses?.length ?? 0;

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="font-extrabold text-2xl leading-tight mb-1"
            style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
          >
            Courses
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "#7A9878" }}>
              {total} total
            </span>
            {publishedCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "#EEF5EE", color: "#2A5230" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A8A52]" />
                {publishedCount} published
              </span>
            )}
            {draftCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "#FFF8E8", color: "#8A6020" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C48A3A]" />
                {draftCount} draft
              </span>
            )}
          </div>
        </div>

        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #2A5230 0%, #1A3820 100%)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(42,82,48,0.3)",
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm1 6V4H7v3H4v2h3v3h2V9h3V7H9Z" />
          </svg>
          New Course
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-16 text-center"
          style={{
            background: "#fff",
            border: "1.5px dashed #C8DEC8",
            boxShadow: "0 2px 12px rgba(42,82,48,0.04)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#EEF5EE" }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style={{ color: "#2A5230" }}>
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            className="font-bold text-lg mb-2"
            style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
          >
            No courses yet
          </h2>
          <p className="text-sm mb-6" style={{ color: "#7A9878" }}>
            Create your first course and start building your curriculum.
          </p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #2A5230 0%, #1A3820 100%)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(42,82,48,0.3)",
            }}
          >
            Create First Course →
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            border: "1.5px solid #E8EDE6",
            boxShadow: "0 2px 12px rgba(42,82,48,0.06)",
          }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 py-3.5 text-[11px] font-bold tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns: "1fr 100px 80px 90px 80px 60px",
              background: "#FAFCFA",
              borderBottom: "1px solid #EEF5EE",
              color: "#9AB89E",
            }}
          >
            <span>Course</span>
            <span>Level</span>
            <span>Price</span>
            <span>Status</span>
            <span>Cert</span>
            <span />
          </div>

          {/* Course rows */}
          <div className="divide-y" style={{ borderColor: "#F5FAF5" }}>
            {courses.map((c) => {
              const s = statusStyle[c.status] ?? statusStyle.draft;
              const l = levelStyle[c.level] ?? { bg: "#F5F5F5", text: "#666" };
              const p = priceStyle[c.price_type] ?? { bg: "#F5F5F5", text: "#666" };
              const initial = String(c.title)[0]?.toUpperCase() ?? "C";

              return (
                <div
                  key={c.id}
                  className="grid items-center px-5 py-4 transition-colors hover:bg-[#FAFCFA] group"
                  style={{ gridTemplateColumns: "1fr 100px 80px 90px 80px 60px" }}
                >
                  {/* Title + slug */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                      style={{ background: "#EEF5EE", color: "#2A5230", fontFamily: "var(--font-head)" }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-semibold truncate"
                        style={{ color: "#1A2E1C" }}
                      >
                        {c.title}
                      </div>
                      <div className="text-xs truncate mt-0.5" style={{ color: "#B8D4B5" }}>
                        /{c.slug}
                      </div>
                    </div>
                  </div>

                  {/* Level */}
                  <div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: l.bg, color: l.text }}
                    >
                      {c.level}
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: p.bg, color: p.text }}
                    >
                      {c.price_type}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: s.bg, color: s.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: s.dot }}
                      />
                      {c.status}
                    </span>
                  </div>

                  {/* Certificate */}
                  <div>
                    {c.certificate_eligible ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: "#FFF8E8", color: "#8A6020" }}
                      >
                        <svg viewBox="0 0 14 14" width="11" height="11" fill="currentColor" style={{ color: "#C48A3A" }}>
                          <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1ZM5.5 7.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#C8DEC8" }}>—</span>
                    )}
                  </div>

                  {/* Edit link */}
                  <div className="text-right">
                    <Link
                      href={`/admin/courses/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: "#EEF5EE", color: "#2A5230" }}
                    >
                      Edit
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                        <path d="M6.293 1.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.086 6 6.293 4.207a1 1 0 0 1 0-1.414ZM1 6a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1Z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
