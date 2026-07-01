"use client";

import Link from "next/link";
import { useState } from "react";

export default function CertActions({ certId }: { certId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/dashboard/certificates/${certId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Link
        href={`/dashboard/certificates/${certId}`}
        className="text-xs font-bold px-3 py-1.5 rounded-lg"
        style={{ background: "#EEF5EE", color: "#2A5230" }}
      >
        View / Print
      </Link>
      <button
        onClick={handleShare}
        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: copied ? "#EEF5EE" : "#F5F0E8",
          color: copied ? "#2A5230" : "#7A9878",
        }}
      >
        {copied ? "Copied!" : "Share"}
      </button>
    </div>
  );
}
