"use client";

import Confetti from "./Confetti";

interface Props {
  title: string;
  message: string;
  showConfetti: boolean;
  score?: number;
  onClose: () => void;
  closeLabel?: string;
}

export default function CompletionModal({ title, message, showConfetti, score, onClose, closeLabel = "Continue" }: Props) {
  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-4" style={{ background: "rgba(10,20,12,0.55)" }}>
      {showConfetti && <Confetti />}
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 text-center"
        style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}
      >
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)" }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h2 className="font-extrabold text-xl mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
          {title}
        </h2>

        {typeof score === "number" && (
          <div className="text-sm font-bold mb-2" style={{ color: "#4A8A52" }}>
            Score: {score}%
          </div>
        )}

        <p className="text-sm leading-relaxed mb-6 whitespace-pre-wrap" style={{ color: "#5A7A5E" }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-bold rounded-xl"
          style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)", color: "#fff" }}
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
