import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  draft:     { label: "Draft",     bg: "#F3F3F3", text: "#666" },
  published: { label: "Published", bg: "#EEF5EE", text: "#2A5230" },
  archived:  { label: "Archived",  bg: "#FFF3DC", text: "#8A6020" },
};

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");

  const db = createAdminClient();
  const { data: quizzes } = await db
    .from("quizzes")
    .select(`
      id, title, passing_score, max_attempts, status, created_at,
      courses:course_id (title),
      lessons:lesson_id (title),
      quiz_questions (id)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Quizzes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{quizzes?.length ?? 0} quizzes</p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="px-4 py-2 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          + New Quiz
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: "1.5px solid var(--admin-border)" }}>
        <div style={{ background: "var(--admin-card-bg)", minWidth: "580px" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Quiz</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Attached to</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Questions</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Pass %</th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {!quizzes?.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>
                    No quizzes yet.{" "}
                    <Link href="/admin/quizzes/new" className="font-bold underline" style={{ color: "var(--admin-accent)" }}>Create one</Link>
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => {
                  const course  = quiz.courses as { title?: string } | null;
                  const lesson  = quiz.lessons as { title?: string } | null;
                  const qCount  = Array.isArray(quiz.quiz_questions) ? quiz.quiz_questions.length : 0;
                  const sm      = STATUS_META[quiz.status] ?? STATUS_META.draft;
                  return (
                    <tr key={quiz.id} className="hover:bg-[#FAFCFA] transition-colors" style={{ borderBottom: "1px solid var(--admin-table-row-border)" }}>
                      <td className="px-5 py-3">
                        <div className="font-medium" style={{ color: "var(--admin-text-primary)" }}>{quiz.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
                          {quiz.max_attempts ? `${quiz.max_attempts} attempt${quiz.max_attempts > 1 ? "s" : ""}` : "Unlimited attempts"}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px]" style={{ color: "var(--admin-text-muted)" }}>
                        {lesson?.title
                          ? <><span style={{ color: "var(--admin-text-dim)" }}>Lesson:</span> {lesson.title}</>
                          : course?.title
                            ? <><span style={{ color: "var(--admin-text-dim)" }}>Course:</span> {course.title}</>
                            : <span style={{ color: "#C8DEC8" }}>—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] font-bold" style={{ color: qCount > 0 ? "#2A5230" : "#C8DEC8" }}>
                          {qCount}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--admin-text-muted)" }}>
                        {quiz.passing_score}%
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.text }}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/quizzes/${quiz.id}`}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: "#EEF5EE", color: "#2A5230" }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
