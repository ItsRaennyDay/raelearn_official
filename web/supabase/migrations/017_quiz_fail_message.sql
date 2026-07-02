-- ============================================================
-- 017 — Quiz fail-modal fields
-- Requires: 016
-- ============================================================

ALTER TABLE public.quizzes
  ADD COLUMN fail_title   text,
  ADD COLUMN fail_message text;
