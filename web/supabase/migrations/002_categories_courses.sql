-- ============================================================
-- 002 — Categories, courses, modules, lessons, resources
-- Requires: 001
-- ============================================================

-- Categories
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Courses
CREATE TABLE public.courses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,
  outcomes            text[],
  requirements        text[],
  category_id         uuid REFERENCES public.categories(id),
  level               course_level NOT NULL DEFAULT 'beginner',
  price_type          course_price_type NOT NULL DEFAULT 'free',
  price_cents         int NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  status              course_status NOT NULL DEFAULT 'draft',
  certificate_eligible boolean NOT NULL DEFAULT false,
  legal_disclaimer    text,
  thumbnail_url       text,
  preview_video_url   text,
  created_by          uuid REFERENCES public.profiles(id),
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Modules
CREATE TABLE public.modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  sort_order  int NOT NULL DEFAULT 0,
  status      course_status NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrolled/public can view published modules"
  ON public.modules FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage modules"
  ON public.modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Lessons
CREATE TABLE public.lessons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title         text NOT NULL,
  lesson_type   lesson_type NOT NULL DEFAULT 'text',
  content       text,
  video_url     text,
  duration_mins int CHECK (duration_mins >= 0),
  sort_order    int NOT NULL DEFAULT 0,
  is_required   boolean NOT NULL DEFAULT true,
  status        course_status NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all lessons"
  ON public.lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
-- NOTE: "Enrolled learners can view published lessons" policy is added in 004
-- after the enrollments table exists.
CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Resources
CREATE TABLE public.resources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  file_path    text,
  external_url text,
  resource_type text,
  access_level resource_access_level NOT NULL DEFAULT 'enrolled',
  file_size_bytes bigint,
  mime_type    text,
  course_id    uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  lesson_id    uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_by   uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public resources visible to all"
  ON public.resources FOR SELECT USING (access_level = 'public');
-- NOTE: "Enrolled learners can view enrolled/paid resources" policy is added in 004
-- after the enrollments table exists.
CREATE POLICY "Admins manage resources"
  ON public.resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
