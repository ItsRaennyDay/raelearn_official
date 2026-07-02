"use client";

import { useState } from "react";
import GroupAccountModal from "./GroupAccountModal";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}

// Drop-in replacement for a <Link href="/signup?type=group"> — group accounts
// aren't buildable yet, so this opens a "coming soon" modal instead of
// silently dropping the visitor into a plain individual signup.
export default function GroupAccountCTA({ className, style, children, onClick }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => { onClick?.(); setOpen(true); }}
        className={className}
        style={style}
      >
        {children}
      </button>
      <GroupAccountModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
