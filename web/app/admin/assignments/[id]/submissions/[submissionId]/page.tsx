import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeForm } from "./GradeForm";
import { BlocksDisplay } from "./BlocksDisplay";

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  submitted:    { label: "Submitted",    bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7ABB" },
  needs_review: { label: "Needs Review", bg: "#FFF8E8", text: "#8A6020", dot: "#C48A3A" },
  approved:     { label: "Approved",     bg: "#EEF5EE", text: "#2A7A4A", dot: "#4A8A52" },
  rejected:     { label: "Rejected",     bg: "#FFF0F0", text: "#AA2222", dot: "#CC4444" },
  draft:        { label: "Draft",        bg: "#F3F3F3", text: "#666",    dot: "#999" },
};

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id: assignmentId, submissionId } = await params;
  const db = createAdminClient();

  const { data: sub } = await db
    .from("assignment_submissions")
    .select(`
      id, status, content_text, file_path, submitted_at, reviewed_at, reviewer_note,
      profiles:user_id (id, full_name, email),
      assignments:assignment_id (
        id, title, instructions, submission_type,
        courses:course_id (title)
      )
    `)
    .eq("id", submissionId)
    .single();

  if (!sub) notFound();

  const profile    = sub.profiles    as { id?: string; full_name?: string; email?: string } | null;
  const assignment = sub.assignments as {
    id?: string; title?: string; instructions?: string; submission_type?: string;
    courses?: { title?: string } | null;
  } | null;

  const name = profile?.full_name || profile?.email?.split("@")[0] || "Unknown Learner";
  const sm   = STATUS_META[sub.status] ?? STATUS_META.draft;

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Back nav */}
      <Link
        href={`/admin/assignments/${assignmentId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-4"
        style={{ color: "var(--admin-text-muted)" }}
      >
        <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
          <path d="M5.707 1.293a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 1 0 1.414-1.414L3.914 6l1.793-1.793a1 1 0 0 0 0-1.414ZM11 6a1 1 0 0 0-1-1H5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1Z" />
        </svg>
        {assignment?.title ?? "Assignment"}
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-extrabold text-xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
              {name}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: sm.bg, color: sm.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
              {sm.label}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
            {assignment?.courses?.title ?? "—"} · {profile?.email ?? ""}
            {sub.submitted_at && ` · Submitted ${new Date(sub.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Left: instructions + submission content */}
        <div className="space-y-4">

          {/* Assignment instructions */}
          <details open className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
            <summary className="px-5 py-4 cursor-pointer font-semibold text-sm select-none flex items-center justify-between" style={{ background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}>
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--admin-text-muted)" }}>
                  <path d="M2 4h12M2 8h8M2 12h6" />
                </svg>
                Assignment Instructions
              </span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style={{ color: "var(--admin-text-dim)" }}>
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </summary>
            <div className="px-5 py-4" style={{ background: "var(--admin-card-bg)" }}>
              <BlocksDisplay blocksJson={assignment?.instructions ?? null} />
            </div>
          </details>

          {/* Learner's submission */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ background: "var(--admin-table-head-bg)", borderBottom: "1px solid var(--admin-border)" }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--admin-text-muted)" }}>
                <path d="M13 3l-9 9-3-1 1-3 9-9 2 2ZM11 5l-6 6" />
              </svg>
              <span className="font-semibold text-sm" style={{ color: "var(--admin-text-primary)" }}>Learner&apos;s Submission</span>
            </div>

            <div className="p-5" style={{ background: "var(--admin-card-bg)" }}>
              {/* Text submission */}
              {sub.content_text ? (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap rounded-xl p-4"
                  style={{ background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)", border: "1px solid var(--admin-border)" }}
                >
                  {sub.content_text}
                </div>
              ) : null}

              {/* File submission */}
              {sub.file_path ? (
                <div className={`${sub.content_text ? "mt-4" : ""} flex items-center gap-3 px-4 py-3 rounded-xl`} style={{ background: "var(--admin-table-head-bg)", border: "1px solid var(--admin-border)" }}>
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--admin-text-muted)", flexShrink: 0 }}>
                    <path d="M4 4h8l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                    <path d="M12 4v4h4" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--admin-text-primary)" }}>
                      {sub.file_path.split("/").pop()}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: "var(--admin-text-dim)" }}>{sub.file_path}</div>
                  </div>
                </div>
              ) : null}

              {/* Nothing submitted */}
              {!sub.content_text && !sub.file_path && (
                <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>No content submitted.</p>
              )}
            </div>
          </div>

          {/* Previous feedback (if already reviewed) */}
          {sub.reviewer_note && sub.status !== "submitted" && (
            <div className="rounded-2xl p-5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--admin-text-dim)" }}>Previous Feedback</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-text-muted)" }}>{sub.reviewer_note}</p>
            </div>
          )}
        </div>

        {/* Right: grading panel */}
        <GradeForm
          submissionId={submissionId}
          assignmentId={assignmentId}
          currentStatus={sub.status}
          currentNote={sub.reviewer_note ?? null}
          reviewedAt={sub.reviewed_at ?? null}
        />
      </div>
    </div>
  );
}
