import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import QuizBuilder, { type Question } from "./QuizBuilder";
import { updateQuizMeta } from "../actions";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

export default async function QuizEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");

  const { id }    = await params;
  const { saved } = await searchParams;
  const db        = createAdminClient();

  const [{ data: quiz }, { data: rawQuestions }] = await Promise.all([
    db.from("quizzes")
      .select("*, courses:course_id(title), lessons:lesson_id(title)")
      .eq("id", id)
      .single(),
    db.from("quiz_questions")
      .select("id, question_text, question_type, options, correct_answer, sort_order")
      .eq("quiz_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!quiz) notFound();

  const questions: Question[] = (rawQuestions ?? []).map((q) => ({
    id:             q.id,
    question_text:  q.question_text,
    question_type:  q.question_type,
    options:        q.options as string[] | null,
    correct_answer: q.correct_answer as { index: number } | null,
    sort_order:     q.sort_order,
  }));

  const course = quiz.courses as { title?: string } | null;
  const lesson = quiz.lessons as { title?: string } | null;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: "var(--admin-text-muted)" }}>
        <Link href="/admin/quizzes" className="hover:text-[#2A5230] transition-colors">← Quizzes</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-accent)" }}>{quiz.title}</span>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--admin-card-bg-alt)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          Quiz settings saved.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Main: question builder */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-head font-extrabold text-[20px]" style={{ color: "var(--admin-text-primary)" }}>
              {quiz.title}
            </h1>
            <span className="text-sm font-bold px-3 py-1 rounded-full" style={{
              background: quiz.status === "published" ? "#EEF5EE" : "#F3F3F3",
              color:      quiz.status === "published" ? "#2A5230" : "#666",
            }}>
              {quiz.status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          {(course?.title || lesson?.title) && (
            <div className="text-[12.5px] mb-4" style={{ color: "var(--admin-text-dim)" }}>
              {lesson?.title
                ? <>Lesson: <span style={{ color: "var(--admin-text-muted)" }}>{lesson.title}</span></>
                : <>Course: <span style={{ color: "var(--admin-text-muted)" }}>{course?.title}</span></>}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 text-[12.5px]" style={{ color: "var(--admin-text-muted)" }}>
            <span>Passing score: <strong style={{ color: "var(--admin-accent)" }}>{quiz.passing_score}%</strong></span>
            <span>·</span>
            <span>Attempts: <strong style={{ color: "var(--admin-accent)" }}>{quiz.max_attempts ?? "Unlimited"}</strong></span>
            <span>·</span>
            <span><strong style={{ color: "var(--admin-accent)" }}>{questions.length}</strong> question{questions.length !== 1 ? "s" : ""}</span>
          </div>

          <QuizBuilder quizId={id} initialQuestions={questions} />
        </div>

        {/* Sidebar: quiz settings */}
        <div className="rounded-[18px] p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-4" style={{ color: "var(--admin-text-muted)" }}>
            Quiz Settings
          </div>
          <form action={updateQuizMeta} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={quiz.id} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Title</label>
              <input
                name="title"
                type="text"
                defaultValue={quiz.title}
                required
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Passing Score (%)</label>
              <input
                name="passing_score"
                type="number"
                min="0"
                max="100"
                defaultValue={quiz.passing_score}
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Max Attempts</label>
              <input
                name="max_attempts"
                type="number"
                min="1"
                defaultValue={quiz.max_attempts ?? ""}
                placeholder="Unlimited"
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Status</label>
              <select
                name="status"
                defaultValue={quiz.status}
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-3 py-2 text-sm font-bold rounded-xl mt-1"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
