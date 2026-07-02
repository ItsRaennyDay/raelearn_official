"use client";

import { useEffect, useState } from "react";
import { useNewsletterSubscribe } from "./useNewsletterSubscribe";

const SHOWN_KEY = "raelearn_nl_exit_shown_at";
const SUBSCRIBED_KEY = "raelearn_nl_subscribed";
const SNOOZE_DAYS = 14;
const ARM_DELAY_MS = 4000;

export default function NewsletterExitModal({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { status, errorMsg, subscribe } = useNewsletterSubscribe("exit_intent");

  useEffect(() => {
    if (isLoggedIn) return;
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;

    const lastShown = localStorage.getItem(SHOWN_KEY);
    if (lastShown && Date.now() - Number(lastShown) < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;

    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, ARM_DELAY_MS);

    function handleMouseOut(e: MouseEvent) {
      if (!armed) return;
      if (e.clientY > 0 || e.relatedTarget) return;
      setOpen(true);
      localStorage.setItem(SHOWN_KEY, String(Date.now()));
      document.removeEventListener("mouseout", handleMouseOut);
    }

    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (status === "success") {
      localStorage.setItem(SUBSCRIBED_KEY, "1");
    }
  }, [status]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#F5F0E8] p-8 shadow-2xl"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#5A7A5E] hover:bg-black/5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="font-extrabold text-xl mb-2" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>You&apos;re on the list!</h2>
            <p className="text-sm text-[#5A6B5D]">Watch your inbox for new courses and updates from RaeLearn.</p>
          </div>
        ) : (
          <>
            <h2 className="font-extrabold text-2xl mb-2" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>
              Don&apos;t miss out
            </h2>
            <p className="text-sm text-[#5A6B5D] mb-5">
              We&apos;re releasing new courses and updates regularly. Get notified before everyone else.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return;
                subscribe(name, email);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="px-4 py-2.5 text-sm rounded-xl border border-[#DDE8DA] bg-white outline-none focus:border-[#4A8A52]"
              />
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
                {status === "loading" ? "Subscribing…" : "Keep Me Posted"}
              </button>
              {status === "error" && <p className="text-xs text-red-600">{errorMsg}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
