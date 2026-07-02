-- ============================================================
-- 018 — Editable transactional email templates
-- Requires: 007 (email_logs)
-- ============================================================

CREATE TABLE public.email_templates (
  key             text PRIMARY KEY,
  label           text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage email templates"
  ON public.email_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  ));
