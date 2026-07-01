"use client";

import { useRef, useState, useTransition } from "react";
import { gradeSubmission } from "./actions";

type Status = "submitted" | "needs_review" | "approved" | "rejected";

const GRADE_OPTIONS: { value: Status; label: string; desc: string; color: string; bg: string }[] = [
  { value: "approved",     label: "Approve",       desc: "Submission meets requirements",   color: "#2A7A4A", bg: "#EEF5EE" },
  { value: "needs_review", label: "Needs Revision", desc: "Ask learner to revise and resubmit", color: "#8A6020", bg: "#FFF8E8" },
  { value: "rejected",     label: "Reject",        desc: "Submission does not meet requirements", color: "#AA2222", bg: "#FFF0F0" },
];

interface Props {
  submissionId: string;
  assignmentId: string;
  currentStatus: string;
  currentNote: string | null;
  reviewedAt: string | null;
}

export function GradeForm({ submissionId, assignmentId, currentStatus, currentNote, reviewedAt }: Props) {
  const [selected, setSelected] = useState<Status>(
    (currentStatus as Status) === "submitted" ? "approved" : (currentStatus as Status)
  );
  const [note, setNote] = useState(currentNote ?? "");
  const [saved, setSaved] = useState(!!reviewedAt);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSelect = (v: Status) => {
    setSelected(v);
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("status", selected);
    setSaved(false);
    startTransition(async () => {
      await gradeSubmission(fd);
      setSaved(true);
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden sticky top-4" style={{ border: "1.5px solid var(--admin-border)" }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: "var(--admin-table-head-bg)", borderBottom: "1px solid var(--admin-border)" }}>
        <h2 className="font-bold text-sm" style={{ color: "var(--admin-text-primary)" }}>Grade Submission</h2>
        {reviewedAt && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
            Last reviewed {new Date(reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4" style={{ background: "var(--admin-card-bg)" }}>
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="assignmentId" value={assignmentId} />

        {/* Grade buttons */}
        <div className="space-y-2">
          <div className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text-muted)" }}>Outcome</div>
          {GRADE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left px-4 py-3 rounded-xl transition-all"
              style={{
                border: `2px solid ${selected === opt.value ? opt.color : "var(--admin-border)"}`,
                background: selected === opt.value ? opt.bg : "var(--admin-card-bg)",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: selected === opt.value ? opt.color : "var(--admin-border-mid)", background: selected === opt.value ? opt.color : "transparent" }}
                >
                  {selected === opt.value && (
                    <svg viewBox="0 0 8 8" width="8" height="8" fill="white">
                      <circle cx="4" cy="4" r="2.5" />
                    </svg>
                  )}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: selected === opt.value ? opt.color : "var(--admin-text-primary)" }}>{opt.label}</div>
                  <div className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>{opt.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--admin-text-muted)" }}>
            Feedback to Learner <span style={{ color: "var(--admin-text-dim)" }}>(optional)</span>
          </label>
          <textarea
            name="reviewerNote"
            value={note}
            onChange={(e) => { setNote(e.target.value); setSaved(false); }}
            rows={5}
            placeholder="Explain your decision, suggest improvements, or add encouragement…"
            className="w-full px-3.5 py-3 text-sm rounded-xl border outline-none resize-none transition-colors"
            style={{
              borderColor: "var(--admin-border-mid)",
              background: "var(--admin-table-head-bg)",
              color: "var(--admin-text-primary)",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 text-sm font-bold rounded-xl transition-all"
          style={{
            background: saved ? "#EEF5EE" : "linear-gradient(135deg, #2A5230 0%, #1A3820 100%)",
            color: saved ? "#2A7A4A" : "#fff",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Saving…" : saved ? "✓ Saved" : "Submit Grade"}
        </button>
      </form>
    </div>
  );
}
