import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const TYPE_META: Record<string, { label: string; bg: string; text: string }> = {
  text: { label: "Text",     bg: "#EEF5EE", text: "#2A5230" },
  file: { label: "File",     bg: "#E8F2FF", text: "#1A4A8A" },
  both: { label: "Text+File",bg: "#F5E8FF", text: "#6B2A8A" },
};

const STATUS_META: Record<string, { bg: string; text: string }> = {
  published: { bg: "#EEF5EE", text: "#2A5230" },
  draft:     { bg: "#FFF8E8", text: "#8A6020" },
  archived:  { bg: "#F3F3F3", text: "#666" },
};

export default async function AssignmentsPage() {
  const db = createAdminClient();

  const { data: assignments } = await db
    .from("assignments")
    .select(`
      id, title, submission_type, status, created_at,
      courses:course_id (id, title),
      lessons:lesson_id (id, title),
      assignment_submissions (id, status)
    `)
    .order("created_at", { ascending: false });

  const allSubs = assignments?.flatMap((a) => a.assignment_submissions ?? []) ?? [];
  const pendingCount  = allSubs.filter((s) => s.status === "submitted" || s.status === "needs_review").length;
  const approvedCount = allSubs.filter((s) => s.status === "approved").length;
  const rejectedCount = allSubs.filter((s) => s.status === "rejected").length;

  const stats = [
    { label: "Total Submissions",  value: allSubs.length,  color: "var(--admin-accent)" },
    { label: "Pending Review",     value: pendingCount,     color: "#8A6020" },
    { label: "Approved",           value: approvedCount,    color: "#2A7A4A" },
    { label: "Rejected / Revise",  value: rejectedCount,    color: "#AA2222" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
          Assignments
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          Review and grade learner submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Assignment list */}
      {!assignments?.length ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px dashed var(--admin-border-mid)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3l5 5-9 9H7V12l9-9Z" /><path d="M14 5l5 5" />
            </svg>
          </div>
          <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>No assignments yet</h2>
          <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Add assignment blocks in the Lesson Editor to create assignments.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                {["Assignment", "Course", "Type", "Submissions", "Pending", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const course = a.courses as { id?: string; title?: string } | null;
                const subs   = a.assignment_submissions ?? [];
                const pending = subs.filter((s) => s.status === "submitted" || s.status === "needs_review").length;
                const typeMeta  = TYPE_META[a.submission_type] ?? TYPE_META.text;
                const statusMeta = STATUS_META[a.status] ?? STATUS_META.draft;
                return (
                  <tr key={a.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}>
                    <td className="px-5 py-3">
                      <div className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>{a.title}</div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      {course?.title ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: typeMeta.bg, color: typeMeta.text }}>
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                      {subs.length}
                    </td>
                    <td className="px-5 py-3">
                      {pending > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "#FFF8E8", color: "#8A6020" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C48A3A]" />
                          {pending}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--admin-text-dim)" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize" style={{ background: statusMeta.bg, color: statusMeta.text }}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/assignments/${a.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                        style={{ background: "#EEF5EE", color: "#2A5230" }}
                      >
                        Review
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                          <path d="M6.293 1.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.086 6 6.293 4.207a1 1 0 0 1 0-1.414ZM1 6a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1Z" />
                        </svg>
                      </Link>
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
