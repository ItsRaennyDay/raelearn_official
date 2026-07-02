"use client";

import { useState } from "react";
import { useNewsletterSubscribe } from "./newsletter/useNewsletterSubscribe";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GroupAccountModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const { status, errorMsg, subscribe } = useNewsletterSubscribe("group_waitlist");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#F5F0E8] p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#5A7A5E] hover:bg-black/5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="font-extrabold text-xl mb-2" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>You&apos;re on the list!</h2>
            <p className="text-sm text-[#5A6B5D]">We&apos;ll email you the moment group accounts are ready.</p>
          </div>
        ) : (
          <>
            <div className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3" style={{ background: "#FFF3DC", color: "#8A6020" }}>
              Coming Soon
            </div>
            <h2 className="font-extrabold text-2xl mb-2" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>
              Group accounts aren&apos;t open yet
            </h2>
            <p className="text-sm text-[#5A6B5D] mb-5">
              We&apos;re still building team seat management, group dashboards, and progress tracking. Leave your email and we&apos;ll let you know the moment it&apos;s ready.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return;
                subscribe("", email);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="px-4 py-2.5 text-sm rounded-xl border border-[#DDE8DA] bg-white outline-none focus:border-[#4A8A52]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-5 py-3 text-sm font-bold rounded-xl bg-[#2A5230] text-white hover:bg-[#1e3d24] transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Submitting…" : "Notify Me at Launch"}
              </button>
              {status === "error" && <p className="text-xs text-red-600">{errorMsg}</p>}
            </form>
            <p className="text-xs mt-4 text-center" style={{ color: "#9AB89E" }}>
              Need something sooner? <a href="/contact?category=group_account" className="font-semibold hover:underline" style={{ color: "#2A5230" }}>Reach out to us directly →</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
