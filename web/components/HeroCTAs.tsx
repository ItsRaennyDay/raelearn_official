"use client";

import Link from "next/link";
import GroupAccountCTA from "./GroupAccountCTA";

export default function HeroCTAs() {
  return (
    <div className="flex gap-3.5 flex-wrap items-center">
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 text-base font-bold text-white bg-[#2A5230] px-6 py-[15px] rounded-xl shadow-[0_6px_18px_rgba(42,82,48,0.22)] whitespace-nowrap hover:bg-[#1e3d24] hover:-translate-y-px transition-all"
      >
        Start Learning <span className="text-[18px] leading-none">→</span>
      </Link>
      <GroupAccountCTA className="inline-flex items-center text-base font-bold text-[#2A5230] bg-white border-[1.6px] border-[#2A5230] px-6 py-[15px] rounded-xl whitespace-nowrap hover:bg-[#2A5230] hover:text-white transition-colors">
        Create Group Account
      </GroupAccountCTA>
    </div>
  );
}
