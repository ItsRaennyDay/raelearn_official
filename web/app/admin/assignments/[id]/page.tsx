import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  submitted:    { label: "Submitted",    bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7ABB" },
  needs_review: { label: "Needs Review", bg: "#FFF8E8", text: "#8A6020", dot: "#C48A3A" },
  approved:     { label: "Approved",     bg: "#EEF5EE", text: "#2A7A4A", dot: "#4A8A52" },
  rejected:     { label: "Rejected",     bg: "#FFF0F0", text: "#AA2222", dot: "#CC4444" },
  draft:        { label: "Draft",        bg: "#F3F3F3", text: "#666",    dot: "#999" },
};

export default async function AssignmentSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: filterStatus = "" } = await searchParams;

  const db = createAdminClient();

  const { data: assignment } = await db
    .from("assignments")
    .select(`
      id, title, instructions, submission_type, status,
      courses:course_id (id, title),
      lessons:lesson_id (id, title)
    `)
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  let query = db
    .from("assignment_submissions")
    .select(`
      id, status, content_text, file_path, submitted_at, reviewed_at, reviewer_note,
      profiles:user_id (id, full_name, email)
    `)
    .eq("assignment_id", id)
    .neq("status", "draft")
    .order("submitted_at", { ascending: false });

  if (filterStatus) query = query.eq("status", filterStatus);

  const { data: submissions } = await query;

  const course = assignment.courses as { id?: string; title?: string } | null;

  const pendingCount  = (submissions ?? []).filter((s) => s.status === "submitted" || s.status === "needs_review").length;
  const approvedCount = (submissions ?? []).filter((s) => s.status === "approved").length;
  const rejectedCount = (submissions ?? []).filter((s) => s.status === "rejected").length;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/admin/assignments" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "var(--admin-text-muted)" }}>
          <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
            <path d="M5.707 1.293a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 1 0 1.414-1.414L3.914 6l1.793-1.793a1 1 0 0 0 0-1.414ZM11 6a1 1 0 0 0-1-1H5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1Z" />
          </svg>
          All Assignments
        </Link>
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
          {assignment.title}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          {course?.title ?? "No course"} · {assignment.submission_type} submission
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Pending Review", value: pendingCount, color: "#8A6020", bg: "#FFF8E8" },
          { label: "Approved",       value: approvedCount, color: "#2A7A4A", bg: "#EEF5EE" },
          { label: "Rejected",       value: rejectedCount, color: "#AA2222", bg: "#FFF0F0" },
        ].map((s) => (
          <div key={s.label} className="px-4 py-2.5 rounded-xl text-center" style={{ background: s.bg, minWidth: 100 }}>
            <div className="text-xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <details className="mb-6 rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
        <summary className="px-5 py-3 cursor-pointer text-sm font-semibold select-none flex items-center justify-between" style={{ background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}>
          Assignment Instructions
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style={{ color: "var(--admin-text-dim)" }}>
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </summary>
        <div className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "var(--admin-card-bg)", color: "var(--admin-text-primary)" }}>
          {assignment.instructions}
        </div>
      </details>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { value: "",             label: "All" },
          { value: "submitted",    label: "Submitted" },
          { value: "needs_review", label: "Needs Review" },
          { value: "approved",     label: "Approved" },
          { value: "rejected",     label: "Rejected" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/assignments/${id}?status=${tab.value}` : `/admin/assignments/${id}`}
            className="px-3 py-1.5 text-xs font-bold rounded-lg"
            style={{
              background: filterStatus === tab.value ? "#2A5230" : "var(--admin-card-bg)",
              color: filterStatus === tab.value ? "#fff" : "var(--admin-text-muted)",
              border: `1px solid ${filterStatus === tab.value ? "#2A5230" : "var(--admin-border-mid)"}`,
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Submissions table */}
      {!submissions?.length ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px dashed var(--admin-border-mid)" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
            {filterStatus ? `No ${filterStatus} submissions.` : "No submissions yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                {["Learner", "Submitted", "Status", "Feedback", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const profile = sub.profiles as { id?: string; full_name?: string; email?: string } | null;
                const sm = STATUS_META[sub.status] ?? STATUS_META.draft;
                const name = profile?.full_name || profile?.email?.split("@")[0] || "Unknown";
                return (
                  <tr key={sub.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>{name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{profile?.email ?? ""}</div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: sm.bg, color: sm.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs max-w-xs truncate" style={{ color: "var(--admin-text-muted)" }}>
                      {sub.reviewer_note ?? <span style={{ color: "var(--admin-text-dim)" }}>—</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/assignments/${id}/submissions/${sub.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                        style={{ background: sub.status === "submitted" || sub.status === "needs_review" ? "#2A5230" : "#EEF5EE", color: sub.status === "submitted" || sub.status === "needs_review" ? "#fff" : "#2A5230" }}
                      >
                        {sub.status === "submitted" || sub.status === "needs_review" ? "Grade" : "View"}
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
