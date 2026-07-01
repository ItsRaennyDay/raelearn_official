"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertQuestion, deleteQuestion, moveQuestion } from "../actions";

type CorrectAnswer = { index: number };

export type Question = {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  correct_answer: CorrectAnswer | null;
  sort_order: number;
};

type FormState = {
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options: [string, string, string, string];
  correct_index: number;
};

const EMPTY_FORM: FormState = {
  question_text: "",
  question_type: "multiple_choice",
  options: ["", "", "", ""],
  correct_index: 0,
};

const LETTER = ["A", "B", "C", "D"];

export default function QuizBuilder({
  quizId,
  initialQuestions,
}: {
  quizId: string;
  initialQuestions: Question[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const questions = initialQuestions;

  function startNew() {
    setForm(EMPTY_FORM);
    setError(null);
    setEditingId("new");
  }

  function startEdit(q: Question) {
    const opts: [string, string, string, string] =
      q.question_type === "true_false"
        ? ["True", "False", "", ""]
        : [
            q.options?.[0] ?? "",
            q.options?.[1] ?? "",
            q.options?.[2] ?? "",
            q.options?.[3] ?? "",
          ];
    setForm({
      question_text: q.question_text,
      question_type: q.question_type as "multiple_choice" | "true_false",
      options: opts,
      correct_index: q.correct_answer?.index ?? 0,
    });
    setError(null);
    setEditingId(q.id);
  }

  function handleSave() {
    if (!form.question_text.trim()) {
      setError("Question text is required.");
      return;
    }
    const isMC = form.question_type === "multiple_choice";
    if (isMC) {
      const filled = form.options.filter((o) => o.trim()).length;
      if (filled < 2) { setError("Add at least 2 options."); return; }
    }
    setError(null);

    const isNew   = editingId === "new";
    const options = isMC
      ? form.options.map((o) => o.trim())
      : ["True", "False"];

    startTransition(async () => {
      await upsertQuestion({
        id:            isNew ? null : editingId,
        quiz_id:       quizId,
        question_text: form.question_text,
        question_type: form.question_type,
        options,
        correct_index: form.correct_index,
        sort_order:    isNew
          ? questions.length
          : (questions.find((q) => q.id === editingId)?.sort_order ?? 0),
      });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(questionId: string) {
    if (!confirm("Delete this question?")) return;
    startTransition(async () => {
      await deleteQuestion(questionId, quizId);
      router.refresh();
    });
  }

  function handleMove(questionId: string, direction: "up" | "down") {
    startTransition(async () => {
      await moveQuestion(questionId, quizId, direction);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        {questions.length === 0 && editingId !== "new" && (
          <div className="rounded-[14px] py-10 text-center text-sm" style={{ color: "#9AB89E", background: "#FAFCFA", border: "1px dashed #DDE8DA" }}>
            No questions yet — add your first one below.
          </div>
        )}

        {questions.map((q, i) =>
          editingId === q.id ? (
            <QuestionForm
              key={q.id}
              form={form}
              setForm={setForm}
              error={error}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
              isPending={isPending}
            />
          ) : (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onEdit={() => startEdit(q)}
              onDelete={() => handleDelete(q.id)}
              onMove={(dir) => handleMove(q.id, dir)}
              isPending={isPending}
            />
          )
        )}

        {editingId === "new" && (
          <QuestionForm
            form={form}
            setForm={setForm}
            error={error}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            isPending={isPending}
          />
        )}
      </div>

      {editingId === null && (
        <button
          onClick={startNew}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border-2 border-dashed transition-colors"
          style={{ borderColor: "#C8DEC8", color: "#4A8A52" }}
        >
          <span className="text-base leading-none">+</span> Add Question
        </button>
      )}
    </div>
  );
}

function QuestionCard({
  question, index, total, onEdit, onDelete, onMove, isPending,
}: {
  question: Question;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  isPending: boolean;
}) {
  const correctIndex = question.correct_answer?.index ?? 0;
  const options      = question.options ?? [];
  const isTF         = question.question_type === "true_false";
  const correctText  = isTF
    ? (correctIndex === 0 ? "True" : "False")
    : (options[correctIndex] ?? "—");

  return (
    <div className="rounded-[14px] px-5 py-4 flex items-start gap-4" style={{ background: "#fff", border: "1px solid #DDE8DA" }}>
      {/* Sort controls */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-1">
        <button onClick={() => onMove("up")} disabled={index === 0 || isPending}
          className="text-[10px] leading-none px-1 py-0.5 rounded disabled:opacity-25 hover:text-[#2A5230] transition-colors" style={{ color: "#9AB89E" }}>
          ▲
        </button>
        <span className="text-[13px] font-extrabold" style={{ color: "#2A5230" }}>{index + 1}</span>
        <button onClick={() => onMove("down")} disabled={index === total - 1 || isPending}
          className="text-[10px] leading-none px-1 py-0.5 rounded disabled:opacity-25 hover:text-[#2A5230] transition-colors" style={{ color: "#9AB89E" }}>
          ▼
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-1.5">
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EEF5EE", color: "#4A8A52" }}>
            {isTF ? "True / False" : "Multiple Choice"}
          </span>
        </div>
        <p className="text-[14px] font-medium mb-2.5" style={{ color: "#1A2E1C" }}>{question.question_text}</p>

        {isTF ? (
          <div className="text-[12.5px]" style={{ color: "#7A9878" }}>
            Correct: <strong style={{ color: "#2A5230" }}>{correctText}</strong>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-[12.5px]">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: i === correctIndex ? "#2A5230" : "#F0F5F1",
                    color:      i === correctIndex ? "#fff"    : "#9AB89E",
                  }}
                >
                  {LETTER[i]}
                </span>
                <span style={{ color: i === correctIndex ? "#1A2E1C" : "#9AB89E" }}>
                  {opt || <em className="opacity-40">Empty</em>}
                </span>
                {i === correctIndex && (
                  <span className="text-[10px] font-bold" style={{ color: "#4A8A52" }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} disabled={isPending}
          className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "#EEF5EE", color: "#2A5230" }}>
          Edit
        </button>
        <button onClick={onDelete} disabled={isPending}
          className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "#FFF0F0", color: "#AA2222" }}>
          Delete
        </button>
      </div>
    </div>
  );
}

function QuestionForm({
  form, setForm, error, onSave, onCancel, isPending,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const isMC = form.question_type === "multiple_choice";

  return (
    <div className="rounded-[14px] p-5 flex flex-col gap-4" style={{ background: "#F0F5F1", border: "1.5px solid #2A5230" }}>
      {/* Type toggle */}
      <div className="flex gap-2">
        {(["multiple_choice", "true_false"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setForm({ ...form, question_type: type, correct_index: 0 })}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors"
            style={form.question_type === type
              ? { background: "#2A5230", color: "#fff" }
              : { background: "#fff", color: "#7A9878", border: "1px solid #DDE8DA" }}
          >
            {type === "multiple_choice" ? "Multiple Choice" : "True / False"}
          </button>
        ))}
      </div>

      {/* Question text */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "#7A9878" }}>Question</label>
        <textarea
          value={form.question_text}
          onChange={(e) => setForm({ ...form, question_text: e.target.value })}
          rows={2}
          placeholder="Enter your question…"
          className="px-4 py-2.5 text-[13.5px] rounded-xl border outline-none resize-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
      </div>

      {/* Options */}
      {isMC ? (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "#7A9878" }}>
            Options <span className="normal-case font-normal" style={{ color: "#9AB89E" }}>— select the correct one</span>
          </label>
          {([0, 1, 2, 3] as const).map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <input
                type="radio"
                name="correct_mc"
                checked={form.correct_index === i}
                onChange={() => setForm({ ...form, correct_index: i })}
                className="accent-[#2A5230] shrink-0"
              />
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background: form.correct_index === i ? "#2A5230" : "#DDE8DA",
                  color:      form.correct_index === i ? "#fff"    : "#7A9878",
                }}
              >
                {LETTER[i]}
              </span>
              <input
                type="text"
                value={form.options[i]}
                onChange={(e) => {
                  const opts = [...form.options] as [string, string, string, string];
                  opts[i] = e.target.value;
                  setForm({ ...form, options: opts });
                }}
                placeholder={`Option ${LETTER[i]}`}
                className="flex-1 px-3 py-2 text-[13px] rounded-xl border outline-none"
                style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "#7A9878" }}>Correct Answer</label>
          <div className="flex gap-4">
            {["True", "False"].map((val, i) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="correct_tf"
                  checked={form.correct_index === i}
                  onChange={() => setForm({ ...form, correct_index: i })}
                  className="accent-[#2A5230]"
                />
                <span className="text-[14px] font-medium" style={{ color: "#1A2E1C" }}>{val}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium" style={{ color: "#AA2222" }}>{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isPending}
          className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-60"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          {isPending ? "Saving…" : "Save Question"}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-bold rounded-xl"
          style={{ background: "#fff", color: "#7A9878", border: "1px solid #DDE8DA" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
