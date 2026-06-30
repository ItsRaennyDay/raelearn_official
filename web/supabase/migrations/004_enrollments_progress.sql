-- ============================================================
-- 004 — Enrollments, progress, certificates
-- Requires: 002
-- ============================================================

-- Enrollments
CREATE TABLE public.enrollments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source          enrollment_source NOT NULL DEFAULT 'free',
  status          enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at     timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz,
  completed_at    timestamptz,
  order_id        uuid, -- FK added after orders table created in 006
  organization_id uuid, -- FK added after orgs table created in 005
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own enrollments"
  ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage all enrollments"
  ON public.enrollments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Lesson progress
CREATE TABLE public.lesson_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed     boolean NOT NULL DEFAULT false,
  time_spent_seconds int NOT NULL DEFAULT 0,
  last_position_seconds int NOT NULL DEFAULT 0,
  completed_at  timestamptz,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own lesson progress"
  ON public.lesson_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view all lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Learning path enrollments
CREATE TABLE public.learning_path_enrollments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  status           enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at      timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  UNIQUE(user_id, learning_path_id)
);
ALTER TABLE public.learning_path_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own path enrollments"
  ON public.learning_path_enrollments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view all path enrollments"
  ON public.learning_path_enrollments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Certificates
CREATE TABLE public.certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id       uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  learning_path_id uuid REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  certificate_number text NOT NULL UNIQUE,
  issued_at       timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz,
  CHECK (
    (course_id IS NOT NULL AND learning_path_id IS NULL) OR
    (course_id IS NULL AND learning_path_id IS NOT NULL)
  )
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Public certificate verification"
  ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins manage certificates"
  ON public.certificates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Generate unique certificate numbers
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  cert_num text;
BEGIN
  LOOP
    cert_num := 'RL-' || to_char(now(), 'YYYY') || '-' || upper(substring(gen_random_uuid()::text, 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.certificates WHERE certificate_number = cert_num);
  END LOOP;
  RETURN cert_num;
END;
$$;
