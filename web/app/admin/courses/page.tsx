import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, level, price_type, status, created_at")
    .order("created_at", { ascending: false });

  const statusColor: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft:     "bg-yellow-100 text-yellow-800",
    archived:  "bg-gray-100 text-gray-600",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-head font-extrabold text-2xl text-[#2A5230]">Courses</h1>
          <p className="text-sm text-[#7A9878] mt-1">{courses?.length ?? 0} total courses</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#2A5230] px-5 py-3 rounded-xl hover:bg-[#1e3d24] transition-colors"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm1 6V4H7v3H4v2h3v3h2V9h3V7H9Z" />
          </svg>
          New Course
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="bg-white border border-[#DDE8DA] rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-2">No courses yet</h2>
          <p className="text-sm text-[#7A9878] mb-6">Create your first course to get started.</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center text-sm font-bold text-white bg-[#2A5230] px-5 py-3 rounded-xl hover:bg-[#1e3d24] transition-colors"
          >
            Create First Course →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#DDE8DA] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#DDE8DA] text-left">
                <th className="px-5 py-3.5 text-xs font-bold tracking-wide text-[#7A9878] uppercase">Title</th>
                <th className="px-5 py-3.5 text-xs font-bold tracking-wide text-[#7A9878] uppercase">Level</th>
                <th className="px-5 py-3.5 text-xs font-bold tracking-wide text-[#7A9878] uppercase">Price</th>
                <th className="px-5 py-3.5 text-xs font-bold tracking-wide text-[#7A9878] uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold tracking-wide text-[#7A9878] uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F7F0]">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FCF9] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-sm text-[#2A5230]">{c.title}</div>
                    <div className="text-xs text-[#7A9878] mt-0.5">{c.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4A6650] capitalize">{c.level}</td>
                  <td className="px-5 py-4 text-sm text-[#4A6650] capitalize">{c.price_type}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColor[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/courses/${c.id}`}
                      className="text-xs font-bold text-[#2A5230] hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
