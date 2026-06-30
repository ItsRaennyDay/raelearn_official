-- ============================================================
-- 001 — Enums, profiles update, waitlist
-- Run first. All other migrations depend on these enums.
-- Idempotent: safe to re-run if types already exist.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'learner','group_learner','group_admin','content_admin','platform_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE course_level AS ENUM ('beginner','intermediate','advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE course_price_type AS ENUM ('free','paid','subscription','bundle_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lesson_type AS ENUM ('text','video','mixed','download','quiz','assignment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_source AS ENUM (
    'free','purchase','organization_assignment','admin_grant','bundle'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('active','completed','expired','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resource_access_level AS ENUM (
    'public','free_account','enrolled','paid','organization','admin_only'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE org_membership_status AS ENUM ('invited','active','suspended','removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quiz_attempt_status AS ENUM ('submitted','passed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_submission_status AS ENUM (
    'draft','submitted','needs_review','approved','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending','paid','failed','refunded','partially_refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('unread','read','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percent','fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend existing profiles table (IF NOT EXISTS guards each column)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role                 user_role NOT NULL DEFAULT 'learner',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url           text,
  ADD COLUMN IF NOT EXISTS goals                text;

-- Update auto-create trigger to stamp role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, interests, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'user_type',
    array(SELECT jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')),
    'learner'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    interests = EXCLUDED.interests;
  RETURN new;
END;
$$;

-- Waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL CHECK (char_length(first_name) <= 80),
  email         text NOT NULL,
  email_norm    text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  learner_type  text,
  interest_area text,
  source        text CHECK (char_length(source) <= 120),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_unique UNIQUE (email_norm)
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit waitlist" ON public.waitlist;
CREATE POLICY "Anyone can submit waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
