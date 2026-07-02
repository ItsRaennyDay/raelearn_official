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
      className="flex flex-col gap-2 max-w-[300px]"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/15 text-[#F5F0E8] placeholder:text-[#5A7A5E] outline-none focus:border-[#7DAA82]"
      />
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/15 text-[#F5F0E8] placeholder:text-[#5A7A5E] outline-none focus:border-[#7DAA82]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2 text-sm font-bold rounded-lg bg-[#4A8A52] text-white hover:bg-[#5A9A62] transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-[#E88]">{errorMsg}</p>}
    </form>
  );
}
