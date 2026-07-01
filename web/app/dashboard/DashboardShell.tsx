"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  firstName: string;
  email: string;
  role: string;
  isAdmin: boolean;
  enrolledCount: number;
  certCount: number;
}

const NAV_SECTIONS = [
  {
    label: "Learning",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        exact: true,
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path d="M2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V4ZM2 13a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3Zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3Z" />
          </svg>
        ),
      },
      {
        label: "My Courses",
        href: "/dashboard/my-courses",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 0 0 5.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 1 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 1 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804Z" />
          </svg>
        ),
      },
      {
        label: "Assignments",
        href: "/dashboard/assignments",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 3l4 4-8 8H5.5V11l8-8Z" />
          </svg>
        ),
      },
      {
        label: "Certificates",
        href: "/dashboard/certificates",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="12" rx="1.5" />
            <circle cx="8" cy="10" r="2.5" />
            <path d="M12 8.5h3M12 10h3M12 11.5h2" />
          </svg>
        ),
      },
      {
        label: "Learning Paths",
        href: "/dashboard/learning-paths",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h3m8 0h3M10 3v3m0 8v3M6.5 6.5l2 2m3 3 2 2M13.5 6.5l-2 2m-3 3-2 2" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Resources",
        href: "/dashboard/resources",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h8l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M12 4v4h4" />
          </svg>
        ),
      },
      {
        label: "Downloads",
        href: "/dashboard/downloads",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3v9m-4-4 4 4 4-4M3 17h14" />
          </svg>
        ),
      },
      {
        label: "Saved Courses",
        href: "/dashboard/saved",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3-6 3V4a1 1 0 0 1 1-1Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1.5 5 1.5 5h-15S4 11.5 4 8a6 6 0 0 1 6-6ZM8.5 16a1.5 1.5 0 0 0 3 0" />
          </svg>
        ),
      },
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="7" r="3" /><path d="M3 18a7 7 0 0 1 14 0" />
          </svg>
        ),
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2" />
            <path d="M10 3v2m0 10v2M3 10h2m10 0h2m-2.93-4.07-1.42 1.42M6.35 13.65l-1.42 1.42M17.07 13.65l-1.42-1.42M6.35 6.35 4.93 4.93" />
          </svg>
        ),
      },
      {
        label: "Billing",
        href: "/dashboard/billing",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="16" height="12" rx="1.5" /><path d="M2 9h16" />
          </svg>
        ),
      },
      {
        label: "Organization",
        href: "/dashboard/organization",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17V8l8-5 8 5v9M8 17v-5h4v5" />
          </svg>
        ),
      },
    ],
  },
];

export default function DashboardShell({
  children, firstName, email, role, isAdmin, enrolledCount, certCount,
}: Props) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F0E8", fontFamily: "var(--font-sans)" }}>

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "w-56 h-screen flex flex-col overflow-y-auto",
          "fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "md:sticky md:shrink-0 md:z-auto md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{ background: "#fff", borderRight: "1px solid #E8EDE6" }}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #EEF5EE" }}>
          <Link href="/" className="block">
            <div className="font-extrabold text-[17px] leading-none" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>
              RaeLearn
            </div>
            <div className="text-[8px] font-bold tracking-[0.22em] uppercase mt-1" style={{ color: "#8AA080" }}>
              by RAEFORM
            </div>
          </Link>
          <button
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            onClick={() => setMobileNavOpen(false)}
            style={{ color: "#9AB89E" }}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #EEF5EE" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "#DDE8DA", color: "#2A5230" }}
            >
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "#1A2E1C" }}>{firstName}</div>
              <div className="text-[10px] truncate capitalize" style={{ color: "#9AB89E" }}>
                {role.replace(/_/g, " ")}
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div className="flex gap-3 mt-3">
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#F5FAF5" }}>
              <div className="text-base font-extrabold" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>{enrolledCount}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#9AB89E" }}>Courses</div>
            </div>
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#FFF8EC" }}>
              <div className="text-base font-extrabold" style={{ fontFamily: "var(--font-head)", color: "#C48A3A" }}>{certCount}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#C4A070" }}>Certs</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <div className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 mb-1.5" style={{ color: "#B8D4B5" }}>
                {section.label}
              </div>
              {section.items.map(({ label, href, icon, ...rest }) => {
                const exact = "exact" in rest ? rest.exact : false;
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-all"
                    style={{
                      background: active ? "#EEF5EE" : "transparent",
                      color: active ? "#2A5230" : "#6A8870",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <span style={{ color: active ? "#4A8A52" : "#A8C4A4" }}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: admin link + sign out */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid #EEF5EE" }}>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold mb-1 transition-colors"
              style={{ background: "#1A2E1C", color: "#7DAA82" }}
            >
              <svg viewBox="0 0 14 14" width="12" height="12" fill="currentColor">
                <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1Zm.75 5.25V3.5h-1.5v2.75H3.5v1.5h2.75V10.5h1.5V7.75H10.5v-1.5H7.75Z" />
              </svg>
              Admin Panel
            </Link>
          )}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left"
              style={{ color: "#9AB89E" }}
            >
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2M9 10l3-3-3-3M12 7H5" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-30"
          style={{ background: "#fff", borderBottom: "1px solid #E8EDE6", minHeight: 52 }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 rounded-lg shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              style={{ color: "#2A5230" }}
            >
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
            <nav className="flex items-center gap-1.5 text-xs min-w-0" style={{ color: "#9AB89E" }}>
              <span className="shrink-0">Dashboard</span>
              {pathname !== "/dashboard" && (
                <>
                  <span className="shrink-0">›</span>
                  <span className="truncate" style={{ color: "#2A5230", fontWeight: 600 }}>
                    {pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </>
              )}
            </nav>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-3"
            style={{ background: "#EEF5EE", color: "#2A5230" }}
          >
            Browse Courses
          </Link>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
