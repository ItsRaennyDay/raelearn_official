"use client";

import { useState } from "react";
import { updateQuizCompletion } from "../actions";
import CompletionModal from "@/components/CompletionModal";

const label = "text-[11px] font-bold tracking-[0.04em] uppercase";
const inputCls = "px-3 py-2 text-[13px] rounded-xl border outline-none";

export default function CompletionTab({
  quizId, initialTitle, initialMessage, initialShowConfetti, initialFailTitle, initialFailMessage,
}: {
  quizId: string;
  initialTitle: string;
  initialMessage: string;
  initialShowConfetti: boolean;
  initialFailTitle: string;
  initialFailMessage: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);
  const [showConfetti, setShowConfetti] = useState(initialShowConfetti);
  const [failTitle, setFailTitle] = useState(initialFailTitle);
  const [failMessage, setFailMessage] = useState(initialFailMessage);
  const [preview, setPreview] = useState<"pass" | "fail" | null>(null);

  return (
    <form action={updateQuizCompletion} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={quizId} />

      {/* Pass */}
      <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
        <div className="mb-1 font-head font-extrabold text-[16px]" style={{ color: "var(--admin-text-primary)" }}>
          If They Pass
        </div>
        <p className="text-[12.5px] mb-5" style={{ color: "var(--admin-text-muted)" }}>
          Shown to a learner in a modal the moment they pass this quiz.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: "var(--admin-text-muted)" }}>Modal Title</label>
            <input
              name="completion_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz Passed!"
              maxLength={120}
              className={inputCls}
              style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: "var(--admin-text-muted)" }}>Message</label>
            <textarea
              name="completion_message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Nice work — you've completed this quiz and can move on to the next lesson."
              maxLength={1000}
              className={`${inputCls} resize-none`}
              style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="show_confetti"
              checked={showConfetti}
              onChange={(e) => setShowConfetti(e.target.checked)}
              className="accent-[#2A5230] w-4 h-4"
            />
            <span className="text-[13px] font-medium" style={{ color: "var(--admin-text-primary)" }}>Show confetti</span>
          </label>

          <div>
            <button
              type="button"
              onClick={() => setPreview("pass")}
              className="px-4 py-2 text-sm font-bold rounded-xl"
              style={{ background: "var(--admin-card-bg)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border-mid)" }}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Fail */}
      <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
        <div className="mb-1 font-head font-extrabold text-[16px]" style={{ color: "var(--admin-text-primary)" }}>
          If They Fail
        </div>
        <p className="text-[12.5px] mb-5" style={{ color: "var(--admin-text-muted)" }}>
          Shown when a learner doesn&apos;t reach the passing score. No confetti here.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: "var(--admin-text-muted)" }}>Modal Title</label>
            <input
              name="fail_title"
              value={failTitle}
              onChange={(e) => setFailTitle(e.target.value)}
              placeholder="Not quite — try again"
              maxLength={120}
              className={inputCls}
              style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: "var(--admin-text-muted)" }}>Message</label>
            <textarea
              name="fail_message"
              value={failMessage}
              onChange={(e) => setFailMessage(e.target.value)}
              rows={4}
              placeholder="Review the lesson material and give it another shot when you're ready."
              maxLength={1000}
              className={`${inputCls} resize-none`}
              style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPreview("fail")}
              className="px-4 py-2 text-sm font-bold rounded-xl"
              style={{ background: "var(--admin-card-bg)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border-mid)" }}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Save Completion Messages
        </button>
      </div>

      {preview === "pass" && (
        <CompletionModal
          variant="pass"
          title={title || "Quiz Passed!"}
          message={message || "Nice work — you've completed this quiz and can move on to the next lesson."}
          showConfetti={showConfetti}
          score={94}
          onClose={() => setPreview(null)}
        />
      )}
      {preview === "fail" && (
        <CompletionModal
          variant="fail"
          title={failTitle || "Not quite — try again"}
          message={failMessage || "Review the lesson material and give it another shot when you're ready."}
          showConfetti={false}
          score={52}
          onClose={() => setPreview(null)}
        />
      )}
    </form>
  );
}
