import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import QuizBuilder, { type Question } from "./QuizBuilder";
import CompletionTab from "./CompletionTab";
import InsightsTab from "./InsightsTab";
import DeleteQuizButton from "./DeleteQuizButton";
import { updateQuizMeta } from "../actions";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

type Tab = "questions" | "completion" | "insights";

export default async function QuizEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");

  const { id }        = await params;
  const { saved, tab: tabParam } = await searchParams;
  const tab: Tab       = tabParam === "completion" ? "completion" : tabParam === "insights" ? "insights" : "questions";
  const db             = createAdminClient();

  const [{ data: quiz }, { data: rawQuestions }, { data: courses }, { data: lessons }] = await Promise.all([
    db.from("quizzes")
      .select("*, courses:course_id(title), lessons:lesson_id(title)")
      .eq("id", id)
      .single(),
    db.from("quiz_questions")
      .select("id, question_text, question_type, options, correct_answer, sort_order")
      .eq("quiz_id", id)
      .order("sort_order", { ascending: true }),
    db.from("courses").select("id, title").order("title"),
    db.from("lessons")
      .select("id, title, modules:module_id(courses:course_id(title))")
      .order("title"),
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

  // Insights: only fetched when the tab is active
  let insights: {
    totalAttempts: number; uniqueTakers: number; passedCount: number; failedCount: number; avgScore: number;
    questionStats: { question_text: string; correctPct: number; totalAnswered: number }[];
    takers: { name: string; email: string; score: number | null; status: string; attemptedAt: string }[];
  } | null = null;

  if (tab === "insights") {
    const { data: attempts } = await db
      .from("quiz_attempts")
      .select("id, user_id, score, status, answers, attempted_at, profiles:user_id(full_name, email)")
      .eq("quiz_id", id)
      .order("attempted_at", { ascending: false });

    const rows = attempts ?? [];
    const totalAttempts = rows.length;
    const uniqueTakers  = new Set(rows.map((r) => r.user_id)).size;
    const passedCount   = rows.filter((r) => r.status === "passed").length;
    const failedCount   = rows.filter((r) => r.status === "failed").length;
    const scores        = rows.map((r) => r.score).filter((s): s is number => typeof s === "number");
    const avgScore      = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const questionStats = questions.map((q) => {
      let correct = 0;
      let answered = 0;
      for (const r of rows) {
        const answers = r.answers as Record<string, number> | null;
        if (!answers || !(q.id in answers)) continue;
        answered++;
        if (answers[q.id] === q.correct_answer?.index) correct++;
      }
      return {
        question_text: q.question_text,
        correctPct: answered > 0 ? Math.round((correct / answered) * 100) : 0,
        totalAnswered: answered,
      };
    });

    const takers = rows.map((r) => {
      const profile = r.profiles as { full_name?: string; email?: string } | null;
      return {
        name: profile?.full_name || profile?.email?.split("@")[0] || "Unknown",
        email: profile?.email ?? "",
        score: r.score,
        status: r.status,
        attemptedAt: r.attempted_at,
      };
    });

    insights = { totalAttempts, uniqueTakers, passedCount, failedCount, avgScore, questionStats, takers };
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "questions",  label: "Questions" },
    { id: "completion", label: "Completion" },
    { id: "insights",   label: "Insights" },
  ];

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

      {/* Tab nav */}
      <div className="flex items-center gap-1 mb-6" style={{ borderBottom: "1.5px solid var(--admin-border)" }}>
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/quizzes/${id}?tab=${t.id}`}
            className="px-4 py-2.5 text-sm font-bold transition-colors"
            style={{
              color: tab === t.id ? "var(--admin-accent)" : "var(--admin-text-muted)",
              borderBottom: tab === t.id ? "2px solid var(--admin-accent)" : "2px solid transparent",
              marginBottom: "-1.5px",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "insights" && insights ? (
        <InsightsTab {...insights} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Main: tab-specific content */}
          <div>
            {tab === "questions" && <QuizBuilder quizId={id} initialQuestions={questions} />}
            {tab === "completion" && (
              <CompletionTab
                quizId={id}
                initialTitle={quiz.completion_title ?? ""}
                initialMessage={quiz.completion_message ?? ""}
                initialShowConfetti={quiz.show_confetti ?? true}
              />
            )}
          </div>

          {/* Sidebar: quiz settings */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[18px] p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-4" style={{ color: "var(--admin-text-muted)" }}>
                Quiz Settings
              </div>
              <form action={updateQuizMeta} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={quiz.id} />
                <input type="hidden" name="tab" value={tab} />

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
                  <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Attached Lesson</label>
                  <select
                    name="lesson_id"
                    defaultValue={quiz.lesson_id ?? ""}
                    className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                    style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--admin-text-muted)" }}>Attached Course</label>
                  <select
                    name="course_id"
                    defaultValue={quiz.course_id ?? ""}
                    className="px-3 py-2 text-[13px] rounded-xl border outline-none"
                    style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
                  >
                    <option value="">None</option>
                    {(courses ?? []).map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <p className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>Only used when no lesson is attached.</p>
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

            <div className="rounded-[18px] p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-3" style={{ color: "#AA2222" }}>
                Danger Zone
              </div>
              <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
