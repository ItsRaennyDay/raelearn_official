-- 015 — Unique constraint so each lesson maps to at most one assignment
ALTER TABLE public.assignments
  ADD CONSTRAINT assignments_lesson_id_unique UNIQUE (lesson_id);
