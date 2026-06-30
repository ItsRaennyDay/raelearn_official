"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/courses",    label: "Courses" },
  { href: "/for-vas",   label: "For VAs" },
  { href: "/pricing",   label: "Pricing" },
] as const;

function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#7A9878] hover:bg-[#F0F7F0] hover:text-[#2A5230] transition-colors"
        >
          ✕
        </button>

        <div className="w-12 h-12 rounded-xl bg-[#DDE8DA] flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <h2 className="font-head font-extrabold text-2xl text-[#2A5230] mb-2">
          Group accounts coming soon
        </h2>
        <p className="text-[#4A6650] text-sm leading-relaxed mb-6">
          We&apos;re building team and organization accounts for nonprofits, agencies, and small businesses. Be the first to know when it launches.
        </p>

        <a
          href="mailto:hello@byraeform.com?subject=Group Account Interest"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2A5230] text-white font-bold text-sm hover:bg-[#1e3d24] transition-colors"
        >
          Get notified → hello@byraeform.com
        </a>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-xl text-sm text-[#7A9878] hover:text-[#2A5230] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const [showGroupModal, setShowGroupModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DDE8DA]">
        <nav className="max-w-[1240px] mx-auto px-7 py-3.5 flex items-center gap-6 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none mr-1 shrink-0">
            <span className="font-head font-extrabold text-[23px] tracking-tight text-[#2A5230]">
              RaeLearn
            </span>
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#8AA080] mt-1">
              by RAEFORM
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-5 flex-wrap text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "py-1.5 border-b-2 whitespace-nowrap transition-colors",
                    active
                      ? "text-[#2A5230] border-[#2A5230] font-bold"
                      : "text-[#4A6650] border-transparent hover:text-[#2A5230] hover:border-[#DDE8DA]",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/signin"
              className="text-sm font-semibold text-[#4A6650] px-1 py-2 whitespace-nowrap hover:text-[#2A5230] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold text-white bg-[#2A5230] px-[17px] py-[11px] rounded-[10px] whitespace-nowrap hover:bg-[#1e3d24] transition-colors"
            >
              Start Learning
            </Link>
            <button
              onClick={() => setShowGroupModal(true)}
              className="text-sm font-bold text-[#2A5230] bg-transparent border-[1.5px] border-[#2A5230] px-[15px] py-[9.5px] rounded-[10px] whitespace-nowrap hover:bg-[#2A5230] hover:text-white transition-colors"
            >
              Create Group Account
            </button>
          </div>
        </nav>
      </header>

      {showGroupModal && <ComingSoonModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
}
