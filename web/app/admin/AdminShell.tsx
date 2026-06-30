"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10Zm8-4a1 1 0 0 0-1 1v3H6a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2h-3V7a1 1 0 0 0-1-1Z" />
      </svg>
    ),
    exact: true,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.357L11.5 5.17 7 7.865V11a1 1 0 0 0 .553.894l4 2A1 1 0 0 0 13 13V7.87l3.606-1.546A1 1 0 0 0 17 5.382l-7-3ZM5 9.382l-2.394 1.026L10 13.618l7.394-3.21L15 9.382v3.236l-4 1.724-4-1.724V9.382Z" />
      </svg>
    ),
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[#F5F0E8]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1A2E1C] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <div className="font-head font-extrabold text-[17px] text-white leading-none">RaeLearn</div>
            <div className="text-[10px] font-bold tracking-[0.18em] text-[#7DAA82] mt-1 uppercase">Admin Panel</div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          {NAV.map(({ label, href, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors",
                  active
                    ? "bg-[#2A5230] text-white"
                    : "text-[#9AB89E] hover:bg-white/8 hover:text-white",
                ].join(" ")}
              >
                <span className="shrink-0">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#7DAA82] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.707 9.707a1 1 0 0 1-1.414-1.414L6.586 6 4.293 3.707a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414l-3 3Z" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
