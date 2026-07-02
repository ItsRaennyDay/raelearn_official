-- ============================================================
-- 016 — Quiz completion modal fields + RLS
-- Requires: 003
-- ============================================================

ALTER TABLE public.quizzes
  ADD COLUMN completion_title   text,
  ADD COLUMN completion_message text,
  ADD COLUMN show_confetti      boolean NOT NULL DEFAULT true;

-- quizzes / quiz_questions had no RLS at all. Lock them down properly so a
-- learner's session-bound client reliably sees the same rows the admin
-- (service-role) client sees — anything else risks the exact "quiz not
-- found" failure this migration accompanies a code fix for.
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quizzes"
  ON public.quizzes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

CREATE POLICY "Enrolled learners can view published quizzes"
  ON public.quizzes FOR SELECT
  USING (
    status = 'published'
    AND (
      EXISTS (
        SELECT 1
        FROM public.lessons l
        JOIN public.modules m ON m.id = l.module_id
        JOIN public.enrollments e ON e.course_id = m.course_id
        WHERE l.id = quizzes.lesson_id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.course_id = quizzes.course_id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
      )
    )
  );

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

CREATE POLICY "Learners can view questions of visible quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_questions.quiz_id)
  );
