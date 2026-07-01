"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LEGAL_LINKS = [
  { href: "/legal/terms",       label: "Terms of Use" },
  { href: "/legal/privacy",     label: "Privacy Policy" },
  { href: "/legal/refund",      label: "Refund Policy" },
  { href: "/legal/disclaimers", label: "Disclaimers" },
] as const;

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-24">
          <div className="bg-[#F5FAF5] border border-[#DDE8DA] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DDE8DA]">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#7A9878]">Legal</p>
            </div>
            <nav className="py-2">
              {LEGAL_LINKS.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "text-[#2A5230] bg-[#DDE8DA]"
                        : "text-[#4A6650] hover:text-[#2A5230] hover:bg-[#EAF2EA]",
                    ].join(" ")}
                  >
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2A5230] shrink-0" />
                    )}
                    {!active && <span className="w-1.5 h-1.5 shrink-0" />}
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <p className="mt-5 px-1 text-[11px] text-[#9AB89E] leading-relaxed">
            Questions? Email{" "}
            <a href="mailto:hello@byraeform.com" className="underline hover:text-[#2A5230] transition-colors">
              hello@byraeform.com
            </a>
          </p>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
