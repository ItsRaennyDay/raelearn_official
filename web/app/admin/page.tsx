import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: courseCount },
    { count: enrollmentCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Courses", value: courseCount ?? 0, href: "/admin/courses" },
    { label: "Total Enrollments", value: enrollmentCount ?? 0, href: "/admin/courses" },
    { label: "Total Learners", value: userCount ?? 0, href: "/admin/courses" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-head font-extrabold text-2xl text-[#2A5230]">Overview</h1>
        <p className="text-sm text-[#7A9878] mt-1">Welcome back, Rae.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-[#DDE8DA] rounded-xl p-6 hover:border-[#2A5230] transition-colors group"
          >
            <div className="text-3xl font-extrabold text-[#2A5230] mb-1">{value}</div>
            <div className="text-sm text-[#7A9878] group-hover:text-[#2A5230] transition-colors">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-head font-bold text-lg text-[#2A5230] mb-4">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#2A5230] px-5 py-3 rounded-xl hover:bg-[#1e3d24] transition-colors"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm1 6V4H7v3H4v2h3v3h2V9h3V7H9Z" />
            </svg>
            Create New Course
          </Link>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2A5230] border border-[#2A5230] px-5 py-3 rounded-xl hover:bg-[#2A5230] hover:text-white transition-colors"
          >
            Manage Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
