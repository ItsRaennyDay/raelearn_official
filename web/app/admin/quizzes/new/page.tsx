import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createQuiz } from "../actions";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

export default async function NewQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");

  const db = createAdminClient();
  const { error } = await searchParams;

  const [{ data: courses }, { data: lessons }] = await Promise.all([
    db.from("courses").select("id, title").order("title"),
    db.from("lessons")
      .select("id, title, modules:module_id(courses:course_id(title))")
      .order("title"),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-2 text-sm" style={{ color: "#7A9878" }}>
        <Link href="/admin/quizzes" className="hover:text-[#2A5230] transition-colors">← Quizzes</Link>
        <span>/</span>
        <span style={{ color: "#2A5230" }}>New Quiz</span>
      </div>

      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>New Quiz</h1>

      {error === "missing-title" && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          Please enter a quiz title.
        </div>
      )}

      <div className="rounded-[18px] p-6" style={{ background: "#fff", border: "1px solid #DDE8DA" }}>
        <form action={createQuiz} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>
              Quiz Title <span style={{ color: "#AA2222" }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Module 1 Knowledge Check"
              className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Course (optional)</label>
              <select
                name="course_id"
                className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              >
                <option value="">None</option>
                {(courses ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Lesson (optional)</label>
              <select
                name="lesson_id"
                className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              >
                <option value="">None</option>
                {(lessons ?? []).map((l) => {
                  const mod = l.modules as { courses?: { title?: string } } | null;
                  const courseTitle = mod?.courses?.title;
                  return (
                    <option key={l.id} value={l.id}>
                      {courseTitle ? `${courseTitle} — ` : ""}{l.title}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Passing Score (%)</label>
              <input
                name="passing_score"
                type="number"
                min="0"
                max="100"
                defaultValue="70"
                className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Max Attempts</label>
              <input
                name="max_attempts"
                type="number"
                min="1"
                placeholder="Unlimited"
                className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="px-6 py-2.5 text-[14px] font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
              Create Quiz
            </button>
            <Link href="/admin/quizzes" className="px-6 py-2.5 text-[14px] font-bold rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
