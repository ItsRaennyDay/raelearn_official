-- ============================================================
-- 008 — Tags system (audience, topic, and future filter groups)
-- Requires: 002
-- ============================================================

-- Tags: name + group lets us have audience:va, topic:operations, etc.
CREATE TABLE public.tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  "group"    text NOT NULL DEFAULT 'general',  -- e.g. 'audience', 'topic'
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags"
  ON public.tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Join: many-to-many between courses and tags
CREATE TABLE public.course_tags (
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag_id    uuid NOT NULL REFERENCES public.tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view course_tags"
  ON public.course_tags FOR SELECT USING (true);
CREATE POLICY "Admins manage course_tags"
  ON public.course_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Index for fast tag lookups per course
CREATE INDEX idx_course_tags_course_id ON public.course_tags (course_id);
CREATE INDEX idx_course_tags_tag_id    ON public.course_tags (tag_id);
CREATE INDEX idx_tags_group            ON public.tags ("group");
