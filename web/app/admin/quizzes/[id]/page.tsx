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
      <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: "#7A9878" }}>
        <Link href="/admin/quizzes" className="hover:text-[#2A5230] transition-colors">← Quizzes</Link>
        <span>/</span>
        <span style={{ color: "#2A5230" }}>{quiz.title}</span>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Quiz settings saved.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Main: question builder */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-head font-extrabold text-[20px]" style={{ color: "#1A2E1C" }}>
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
            <div className="text-[12.5px] mb-4" style={{ color: "#9AB89E" }}>
              {lesson?.title
                ? <>Lesson: <span style={{ color: "#4A6650" }}>{lesson.title}</span></>
                : <>Course: <span style={{ color: "#4A6650" }}>{course?.title}</span></>}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 text-[12.5px]" style={{ color: "#7A9878" }}>
            <span>Passing score: <strong style={{ color: "#2A5230" }}>{quiz.passing_score}%</strong></span>
            <span>·</span>
            <span>Attempts: <strong style={{ color: "#2A5230" }}>{quiz.max_attempts ?? "Unlimited"}</strong></span>
            <span>·</span>
            <span><strong style={{ color: "#2A5230" }}>{questions.length}</strong> question{questions.length !== 1 ? "s" : ""}</span>
          </div>

          <QuizBuilder quizId={id} initialQuestions={questions} />
        </div>

        {/* Sidebar: quiz settings */}
        <div className="rounded-[18px] p-5" style={{ background: "#fff", border: "1px solid #DDE8DA" }}>
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-4" style={{ color: "#7A9878" }}>
            Quiz Settings
          </div>
          <form action={updateQuizMeta} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={quiz.id} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Title</label>
              <input
                name="title"
                type="text"
                defaultValue={quiz.title}
                required
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Passing Score (%)</label>
              <input
                name="passing_score"
                type="number"
                min="0"
                max="100"
                defaultValue={quiz.passing_score}
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Max Attempts</label>
              <input
                name="max_attempts"
                type="number"
                min="1"
                defaultValue={quiz.max_attempts ?? ""}
                placeholder="Unlimited"
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Status</label>
              <select
                name="status"
                defaultValue={quiz.status}
                className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
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
