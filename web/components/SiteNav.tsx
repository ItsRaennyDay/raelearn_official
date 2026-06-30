"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/courses",    label: "Courses" },
  { href: "/for-vas",   label: "For VAs" },
  { href: "/pricing",   label: "Pricing" },
] as const;

export default function SiteNav() {
  const pathname = usePathname();

  return (
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
            href="/signup"
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
          <Link
            href="/signup?type=group"
            className="text-sm font-bold text-[#2A5230] bg-transparent border-[1.5px] border-[#2A5230] px-[15px] py-[9.5px] rounded-[10px] whitespace-nowrap hover:bg-[#2A5230] hover:text-white transition-colors"
          >
            Create Group Account
          </Link>
        </div>
      </nav>
    </header>
  );
}
