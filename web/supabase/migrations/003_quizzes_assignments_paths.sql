-- ============================================================
-- 003 — Quizzes, assignments, learning paths
-- Requires: 002
-- ============================================================

-- Quizzes
CREATE TABLE public.quizzes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id     uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title         text NOT NULL,
  passing_score int NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  max_attempts  int,
  status        course_status NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options       jsonb,
  correct_answer jsonb NOT NULL,
  sort_order    int NOT NULL DEFAULT 0
);

CREATE TABLE public.quiz_attempts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     uuid NOT NULL REFERENCES public.quizzes(id),
  user_id     uuid NOT NULL REFERENCES public.profiles(id),
  answers     jsonb,
  score       int,
  status      quiz_attempt_status NOT NULL DEFAULT 'submitted',
  attempted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Assignments
CREATE TABLE public.assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id       uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title           text NOT NULL,
  instructions    text NOT NULL,
  submission_type text NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text','file','both')),
  max_file_size_mb int DEFAULT 10,
  status          course_status NOT NULL DEFAULT 'draft',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.assignment_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id),
  user_id       uuid NOT NULL REFERENCES public.profiles(id),
  content_text  text,
  file_path     text,
  status        assignment_submission_status NOT NULL DEFAULT 'draft',
  reviewer_id   uuid REFERENCES public.profiles(id),
  reviewer_note text,
  submitted_at  timestamptz,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own submissions"
  ON public.assignment_submissions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins manage all submissions"
  ON public.assignment_submissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Learning paths
CREATE TABLE public.learning_paths (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,
  status              course_status NOT NULL DEFAULT 'draft',
  certificate_eligible boolean NOT NULL DEFAULT false,
  created_by          uuid REFERENCES public.profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published paths"
  ON public.learning_paths FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage paths"
  ON public.learning_paths FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

CREATE TABLE public.learning_path_courses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id        uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order       int NOT NULL DEFAULT 0,
  is_required      boolean NOT NULL DEFAULT true,
  UNIQUE(learning_path_id, course_id)
);
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view path courses" ON public.learning_path_courses FOR SELECT USING (true);
