"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DarkModeToggle } from "./DarkModeToggle";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        exact: true,
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path d="M2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V4ZM2 13a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3Zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 0 0 5.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 1 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 1 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804Z" />
          </svg>
        ),
      },
      {
        label: "Modules",
        href: "/admin/modules",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="16" height="4" rx="1" fill="currentColor" stroke="none" opacity=".2" />
            <rect x="2" y="9" width="16" height="4" rx="1" fill="currentColor" stroke="none" opacity=".4" />
            <rect x="2" y="15" width="10" height="2.5" rx="1" fill="currentColor" stroke="none" opacity=".6" />
          </svg>
        ),
      },
      {
        label: "Lessons",
        href: "/admin/lessons",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h12M4 9h12M4 13h8" />
          </svg>
        ),
      },
      {
        label: "Quizzes",
        href: "/admin/quizzes",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M7.5 8a2.5 2.5 0 0 1 4.33 1.25c0 1.25-2.5 2.5-2.5 2.5" />
            <circle cx="9.75" cy="14" r=".75" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
      {
        label: "Assignments",
        href: "/admin/assignments",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 3l4 4-8 8H5.5V11l8-8Z" />
          </svg>
        ),
      },
      {
        label: "Resources",
        href: "/admin/resources",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h8l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
            <path d="M12 4v4h4" />
          </svg>
        ),
      },
      {
        label: "Certificates",
        href: "/admin/certificates",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="12" rx="1.5" />
            <circle cx="8" cy="10" r="2.5" />
            <path d="M12 8.5h3M12 10h3M12 11.5h2" />
          </svg>
        ),
      },
      {
        label: "Tags",
        href: "/admin/tags",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2.5H4a1.5 1.5 0 0 0-1.5 1.5v5.5l8 8a1.5 1.5 0 0 0 2.1 0l5-5a1.5 1.5 0 0 0 0-2.1l-8-8Z" />
            <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
      {
        label: "Bundles",
        href: "/admin/bundles",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".2" stroke="none" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4" stroke="none" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4" stroke="none" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6" stroke="none" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 17a7 7 0 1 1 14 0" />
          </svg>
        ),
      },
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 7.5A4.5 4.5 0 0 1 12 5.5M3.5 7.5h13M3.5 7.5v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
            <path d="M7 12l2 2 4-4" />
          </svg>
        ),
      },
      {
        label: "Organizations",
        href: "/admin/organizations",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17V8l8-5 8 5v9" />
            <path d="M8 17v-5h4v5" />
            <path d="M2 8h16" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h2l.4 2M7 13h10l2-7H5.4M7 13l-1.6-8M7 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
          </svg>
        ),
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10a2 2 0 0 0 2-2V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0-2-2Z" />
            <path d="M8 8l4 4M12 8l-4 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17V13M7 17V9M11 17V11M15 17V5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Support",
        href: "/admin/support",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5l3 2" />
          </svg>
        ),
      },
      {
        label: "Email Templates",
        href: "/admin/email-templates",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="13" rx="1.5" />
            <path d="M2 7l8 5.5L18 7" />
          </svg>
        ),
      },
      {
        label: "Newsletter",
        href: "/admin/newsletter",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7Z" />
            <path d="M3.5 5l6.5 5 6.5-5" />
          </svg>
        ),
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4" />
            <path d="M15 3l2 2-6 6H9V9l6-6Z" />
          </svg>
        ),
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2.5" />
            <path d="M10 2.5a1.2 1.2 0 0 1 1.2 1.2v.5a5.5 5.5 0 0 1 1.3.75l.4-.25a1.2 1.2 0 0 1 1.65.44l.5.87a1.2 1.2 0 0 1-.44 1.64l-.44.25a5.5 5.5 0 0 1 0 1.5l.44.26a1.2 1.2 0 0 1 .44 1.64l-.5.86a1.2 1.2 0 0 1-1.65.44l-.4-.25a5.5 5.5 0 0 1-1.3.75v.5A1.2 1.2 0 0 1 10 17.5a1.2 1.2 0 0 1-1.2-1.2v-.5a5.5 5.5 0 0 1-1.3-.75l-.4.25a1.2 1.2 0 0 1-1.65-.44l-.5-.86a1.2 1.2 0 0 1 .44-1.64l.44-.26a5.5 5.5 0 0 1 0-1.5l-.44-.25A1.2 1.2 0 0 1 4.95 8.7l.5-.87a1.2 1.2 0 0 1 1.65-.44l.4.25a5.5 5.5 0 0 1 1.3-.75v-.5A1.2 1.2 0 0 1 10 2.5Z" />
          </svg>
        ),
      },
    ],
  },
];

const BREADCRUMB: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/courses": "Courses",
  "/admin/modules": "Modules",
  "/admin/lessons": "Lessons",
  "/admin/quizzes": "Quizzes",
  "/admin/assignments": "Assignments",
  "/admin/resources": "Resources",
  "/admin/certificates": "Certificates",
  "/admin/certificates/templates": "Templates",
  "/admin/tags": "Tags",
  "/admin/bundles": "Bundles",
  "/admin/users": "Users",
  "/admin/enrollments": "Enrollments",
  "/admin/organizations": "Organizations",
  "/admin/orders": "Orders",
  "/admin/coupons": "Coupons",
  "/admin/reports": "Reports",
  "/admin/support": "Support",
  "/admin/email-templates": "Email Templates",
  "/admin/newsletter": "Newsletter",
  "/admin/audit-logs": "Audit Logs",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/courses/new")) return "New Course";
  if (pathname.includes("/lessons/")) return "Lesson Editor";
  if (/^\/admin\/courses\/[^/]+$/.test(pathname)) return "Course Editor";
  if (/^\/admin\/bundles\/[^/]+$/.test(pathname)) return "Edit Bundle";
  if (pathname === "/admin/certificates/templates/new") return "New Template";
  if (/^\/admin\/certificates\/templates\/[^/]+$/.test(pathname)) return "Edit Template";
  if (pathname.includes("/submissions/")) return "Review Submission";
  if (/^\/admin\/assignments\/[^/]+$/.test(pathname)) return "Assignment";
  const match = Object.entries(BREADCRUMB).find(([k]) => pathname.startsWith(k) && k !== "/admin");
  return match ? match[1] : "Admin";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  return (
    <div className="admin-shell h-screen flex overflow-hidden" style={{ background: "var(--admin-shell-bg)", fontFamily: "var(--font-sans)" }}>

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "w-56 flex flex-col h-screen",
          "fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "md:sticky md:shrink-0 md:z-auto md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{
          background: "linear-gradient(180deg, #1E3320 0%, #162814 100%)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.18)",
        }}
      >
        {/* Brand header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <Link href="/" className="block group">
            <div
              className="font-extrabold text-[17px] leading-none"
              style={{ fontFamily: "var(--font-head)", color: "#fff" }}
            >
              Rae<span style={{ color: "#B8D8A8" }}>Learn</span>
            </div>
            <div
              className="text-[9px] font-bold tracking-[0.22em] uppercase mt-1.5"
              style={{ color: "#90B880" }}
            >
              Creator Studio
            </div>
          </Link>
          <button
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            style={{ color: "#90B880" }}
          >
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <div
                className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 mb-1.5"
                style={{ color: "#90B480" }}
              >
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
                      background: active ? "rgba(255,255,255,0.16)" : "transparent",
                      color: active ? "#fff" : "#C0D8B4",
                      borderLeft: active ? "2px solid #B8D8A8" : "2px solid transparent",
                    }}
                  >
                    <span
                      className="shrink-0"
                      style={{ color: active ? "#B8D8A8" : "#90B480" }}
                    >
                      {icon}
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin tag + back link */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <div
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl mb-1.5"
            style={{ background: "rgba(0,0,0,0.12)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              R
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: "#E8F5E2" }}>Rae</div>
              <div className="text-[10px]" style={{ color: "#90B480" }}>Platform Admin</div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            style={{ color: "#90B480" }}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header
          className="admin-header h-14 shrink-0 flex items-center justify-between px-4 md:px-8"
          style={{
            background: "var(--admin-header-bg)",
            borderBottom: "1px solid var(--admin-header-border)",
            boxShadow: "0 1px 4px var(--admin-header-shadow)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 rounded-lg shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              style={{ color: "var(--admin-accent)" }}
            >
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs min-w-0" style={{ color: "var(--admin-text-muted)" }}>
              <span className="hidden sm:inline shrink-0">Admin</span>
              <span className="hidden sm:inline shrink-0" style={{ color: "var(--admin-border-mid)" }}>›</span>
              <span className="truncate font-semibold" style={{ color: "var(--admin-text-primary)" }}>{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DarkModeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="admin-main flex-1 overflow-y-auto flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
