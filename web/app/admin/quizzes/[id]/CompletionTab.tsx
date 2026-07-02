"use client";

import { useState } from "react";
import { updateQuizCompletion } from "../actions";
import CompletionModal from "@/components/CompletionModal";

const label = "text-[11px] font-bold tracking-[0.04em] uppercase";
const inputCls = "px-3 py-2 text-[13px] rounded-xl border outline-none";

export default function CompletionTab({
  quizId, initialTitle, initialMessage, initialShowConfetti,
}: {
  quizId: string;
  initialTitle: string;
  initialMessage: string;
  initialShowConfetti: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);
  const [showConfetti, setShowConfetti] = useState(initialShowConfetti);
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
      <div className="mb-1 font-head font-extrabold text-[16px]" style={{ color: "var(--admin-text-primary)" }}>
        Completion Modal
      </div>
      <p className="text-[12.5px] mb-5" style={{ color: "var(--admin-text-muted)" }}>
        Shown to a learner in a modal the moment they pass this quiz.
      </p>

      <form action={updateQuizCompletion} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={quizId} />

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

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-bold rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Save Completion Message
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="px-4 py-2 text-sm font-bold rounded-xl"
            style={{ background: "var(--admin-card-bg)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border-mid)" }}
          >
            Preview
          </button>
        </div>
      </form>

      {preview && (
        <CompletionModal
          title={title || "Quiz Passed!"}
          message={message || "Nice work — you've completed this quiz and can move on to the next lesson."}
          showConfetti={showConfetti}
          score={94}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}
