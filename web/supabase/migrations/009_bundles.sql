-- ============================================================
-- 009 — Bundles (learning tracks / course collections)
-- Requires: 002
-- ============================================================

-- Add audience/published columns to existing bundles table
ALTER TABLE public.bundles
  ADD COLUMN IF NOT EXISTS audience     text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order   int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- Ordered courses within a bundle
CREATE TABLE IF NOT EXISTS public.bundle_courses (
  bundle_id  uuid NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, course_id)
);
ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bundle_courses"
  ON public.bundle_courses FOR SELECT USING (true);
CREATE POLICY "Admins manage bundle_courses"
  ON public.bundle_courses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- RLS on bundles
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published bundles"
  ON public.bundles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins view all bundles"
  ON public.bundles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
CREATE POLICY "Admins manage bundles"
  ON public.bundles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

CREATE INDEX IF NOT EXISTS idx_bundle_courses_bundle_id ON public.bundle_courses (bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundles_audience         ON public.bundles (audience);
CREATE INDEX IF NOT EXISTS idx_bundles_published        ON public.bundles (is_published);
