"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/courses",  label: "Courses" },
  { href: "/for-vas",  label: "For VAs" },
  { href: "/pricing",  label: "Pricing" },
] as const;

type NavUser = { id: string; email: string; full_name: string | null };

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

function UserMenu({ user, onClose }: { user: NavUser; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose?.();
    router.push("/");
    router.refresh();
  }

  const displayName = user.full_name ?? user.email.split("@")[0];
  const initial = (user.full_name ?? user.email).charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-[#DDE8DA] hover:border-[#2A5230] transition-colors bg-white"
      >
        <span className="w-7 h-7 rounded-full bg-[#2A5230] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span className="text-sm font-semibold text-[#2A5230] max-w-[120px] truncate">{displayName}</span>
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#7A9878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-[#DDE8DA] rounded-2xl shadow-[0_12px_32px_-8px_rgba(42,82,48,0.18)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#F0F7F0]">
            <div className="text-xs font-bold text-[#1A2E1C] truncate">{displayName}</div>
            <div className="text-[11px] text-[#9AB89E] truncate mt-0.5">{user.email}</div>
          </div>
          <div className="py-1.5">
            <Link
              href="/dashboard"
              onClick={() => { setOpen(false); onClose?.(); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#2A5230] hover:bg-[#F5FAF5] transition-colors"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="6" height="6" rx="1.5" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/my-courses"
              onClick={() => { setOpen(false); onClose?.(); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#2A5230] hover:bg-[#F5FAF5] transition-colors"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h12M2 7h12M2 11h8" />
              </svg>
              My Courses
            </Link>
          </div>
          <div className="border-t border-[#F0F7F0] py-1.5">
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold text-[#7A4A4A] hover:bg-[#FFF5F5] transition-colors"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteNav({ user }: { user?: NavUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DDE8DA]">
        <nav className="max-w-[1240px] mx-auto px-5 md:px-7 py-3.5 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="font-head font-extrabold text-[23px] tracking-tight text-[#2A5230]">
              RaeLearn
            </span>
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#8AA080] mt-1">
              by RAEFORM
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium ml-2">
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

          {/* Desktop right — auth-aware */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile right — avatar or hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {user && <UserMenu user={user} onClose={() => setMenuOpen(false)} />}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[#F0F7F0] transition-colors"
            >
              <span className={[
                "block w-5 h-[1.5px] bg-[#2A5230] transition-all duration-200 origin-center",
                menuOpen ? "rotate-45 translate-y-[6.5px]" : "",
              ].join(" ")} />
              <span className={[
                "block w-5 h-[1.5px] bg-[#2A5230] transition-all duration-200",
                menuOpen ? "opacity-0 scale-x-0" : "",
              ].join(" ")} />
              <span className={[
                "block w-5 h-[1.5px] bg-[#2A5230] transition-all duration-200 origin-center",
                menuOpen ? "-rotate-45 -translate-y-[6.5px]" : "",
              ].join(" ")} />
            </button>
          </div>
        </nav>

      </header>

      {/* Mobile menu — fixed overlay below the sticky header */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] z-40 bg-white border-b border-[#DDE8DA] shadow-[0_8px_24px_-4px_rgba(42,82,48,0.10)]">
          <div className="px-5 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors",
                    active
                      ? "text-[#2A5230] bg-[#F0F7F0] font-bold"
                      : "text-[#4A6650] hover:text-[#2A5230] hover:bg-[#F5FAF5]",
                  ].join(" ")}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#2A5230] shrink-0" />}
                  {label}
                </Link>
              );
            })}
          </div>

          {!user && (
            <div className="px-5 pb-5 pt-1 border-t border-[#F0F7F0] space-y-2.5">
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-xl bg-[#2A5230] text-white text-sm font-bold hover:bg-[#1e3d24] transition-colors"
              >
                Start Learning
              </Link>
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-xl border border-[#DDE8DA] text-[#4A6650] text-sm font-semibold hover:border-[#2A5230] hover:text-[#2A5230] transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={() => { setMenuOpen(false); setShowGroupModal(true); }}
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-[#7A9878] hover:text-[#2A5230] transition-colors"
              >
                Create Group Account
              </button>
            </div>
          )}

          {user && (
            <div className="px-5 pb-5 pt-1 border-t border-[#F0F7F0] space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#2A5230] hover:bg-[#F5FAF5] transition-colors"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/dashboard/my-courses"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[#2A5230] hover:bg-[#F5FAF5] transition-colors"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h12M2 7h12M2 11h8" />
                </svg>
                My Courses
              </Link>
            </div>
          )}
        </div>
      )}

      {showGroupModal && <ComingSoonModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
}
