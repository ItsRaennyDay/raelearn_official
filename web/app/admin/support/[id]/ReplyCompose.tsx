"use client";

import { useState } from "react";

export default function ReplyCompose({
  email,
  ticketId,
  subject,
  submitterName,
}: {
  email: string;
  ticketId: string;
  subject: string;
  submitterName: string | null;
}) {
  const greeting = `Hi ${submitterName ?? "there"},\n\n`;
  const signature = `\n\nBest,\nRae\nRaeLearn by RAEFORM`;
  const [body, setBody] = useState(greeting + signature);

  const openInGmail = () => {
    const replySubject = `Re: [${ticketId}] ${subject}`;
    const url =
      `https://mail.google.com/mail/?view=cm` +
      `&to=${encodeURIComponent(email)}` +
      `&su=${encodeURIComponent(replySubject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--admin-text-muted)" }}>
          Reply
        </div>
        <div className="text-[11.5px]" style={{ color: "var(--admin-text-dim)" }}>
          To: <span style={{ color: "var(--admin-text-muted)" }}>{email}</span>
        </div>
      </div>

      <div
        className="text-[11.5px] px-3 py-2 rounded-lg mb-3 font-mono truncate"
        style={{ background: "#F0F5F1", color: "var(--admin-text-muted)" }}
      >
        Subject: Re: [{ticketId}] {subject}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 text-[13.5px] rounded-xl border outline-none resize-none mb-3"
        style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)", fontFamily: "inherit" }}
        placeholder="Type your reply…"
      />

      <button
        onClick={openInGmail}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13.5px] font-bold rounded-xl transition-colors"
        style={{ background: "#2A5230", color: "#fff" }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
        </svg>
        Open in Gmail
      </button>
      <p className="text-[11px] mt-2 text-center" style={{ color: "#B8CEB8" }}>
        Opens Gmail with this message pre-filled. Hit Send there to complete.
      </p>
    </div>
  );
}
