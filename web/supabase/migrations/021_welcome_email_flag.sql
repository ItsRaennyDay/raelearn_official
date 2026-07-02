-- ============================================================
-- 021 — Track whether the welcome email has been sent
-- Requires: 011 (profiles.email)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;
