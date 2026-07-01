-- ============================================================
-- 012 — Add preferences column to profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{
    "email_enrollment": true,
    "email_updates": true,
    "email_support": true
  }'::jsonb;
