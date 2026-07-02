"use client";

import { useTransition } from "react";
import { deleteQuiz } from "../actions";

export default function DeleteQuizButton({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${quizTitle}"? This removes all questions and learner attempts. This can't be undone.`)) return;
    startTransition(async () => {
      await deleteQuiz(quizId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-full px-3 py-2 text-sm font-bold rounded-xl disabled:opacity-60 transition-colors"
      style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}
    >
      {isPending ? "Deleting…" : "Delete Quiz"}
    </button>
  );
}
