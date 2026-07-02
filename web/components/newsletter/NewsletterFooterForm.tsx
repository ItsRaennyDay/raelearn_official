"use client";

import { useState } from "react";
import { useNewsletterSubscribe } from "./useNewsletterSubscribe";

export default function NewsletterFooterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { status, errorMsg, subscribe } = useNewsletterSubscribe("footer");

  if (status === "success") {
    return (
      <p className="text-sm font-semibold text-[#7DAA82]">
        You&apos;re on the list! Watch your inbox for updates.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) return;
        subscribe(name, email);
      }}
      className="flex flex-col gap-2 w-full md:w-auto"
    >
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="flex-1 min-w-[140px] px-3 py-2.5 text-sm rounded-lg bg-white/[0.06] border border-white/15 text-[#F5F0E8] placeholder:text-[#5A7A5E] outline-none focus:border-[#7DAA82]"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="flex-[2] min-w-[220px] px-3 py-2.5 text-sm rounded-lg bg-white/[0.06] border border-white/15 text-[#F5F0E8] placeholder:text-[#5A7A5E] outline-none focus:border-[#7DAA82]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-5 py-2.5 text-sm font-bold rounded-lg bg-[#4A8A52] text-white hover:bg-[#5A9A62] transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-[#E88]">{errorMsg}</p>}
    </form>
  );
}
