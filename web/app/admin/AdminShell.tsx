"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      {
        label: "Overview",
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
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#F5F0E8", fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{
          background: "linear-gradient(180deg, #1A2E1C 0%, #0F1F10 100%)",
          boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand header */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" className="block group">
            <div
              className="font-extrabold text-[18px] leading-none"
              style={{ fontFamily: "var(--font-head)", color: "#fff" }}
            >
              Rae<span style={{ color: "#7DAA82" }}>Learn</span>
            </div>
            <div
              className="text-[9px] font-bold tracking-[0.22em] uppercase mt-1.5"
              style={{ color: "#4A7A4E" }}
            >
              Creator Studio
            </div>
          </Link>

          {/* Sketch underline */}
          <svg viewBox="0 0 120 6" width="120" height="6" className="mt-3 opacity-30">
            <path
              d="M2 4 Q30 1 60 3.5 Q90 6 118 2"
              stroke="#7DAA82"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <div
                className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-2"
                style={{ color: "#3A5C3E" }}
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all"
                    style={{
                      background: active ? "rgba(122,168,130,0.18)" : "transparent",
                      color: active ? "#A8D4AC" : "#6A9870",
                      borderLeft: active ? "2px solid #5A9E62" : "2px solid transparent",
                    }}
                  >
                    <span
                      className="shrink-0"
                      style={{ color: active ? "#7DAA82" : "#4A6A4E" }}
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
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
              style={{ background: "#2A5230", color: "#A8D4AC" }}
            >
              R
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: "#C8E6CA" }}>Rae</div>
              <div className="text-[10px]" style={{ color: "#4A6A4E" }}>Platform Admin</div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ color: "#4A6A4E" }}
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
          className="h-14 shrink-0 flex items-center justify-between px-8"
          style={{
            background: "#fff",
            borderBottom: "1px solid #E8EDE6",
            boxShadow: "0 1px 4px rgba(42,82,48,0.06)",
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "#7A9878" }}>
            <span>Admin</span>
            <span style={{ color: "#DDE8DA" }}>›</span>
            <span style={{ color: "#2A5230", fontWeight: 600 }}>
              {pathname === "/admin"
                ? "Overview"
                : pathname.startsWith("/admin/courses/new")
                ? "New Course"
                : pathname.includes("/lessons/")
                ? "Lesson Editor"
                : pathname.startsWith("/admin/courses/") && pathname !== "/admin/courses"
                ? "Course Editor"
                : "Courses"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              <svg viewBox="0 0 14 14" width="11" height="11" fill="currentColor">
                <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1Zm.75 5.25V3.5h-1.5v2.75H3.5v1.5h2.75V10.5h1.5V7.75H10.5v-1.5H7.75Z" />
              </svg>
              New Course
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: "#7A9878", background: "#F5F0E8" }}
            >
              View Site ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
