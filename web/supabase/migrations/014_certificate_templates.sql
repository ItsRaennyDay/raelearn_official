-- ============================================================
-- 014 — Certificate templates + course assignment
-- ============================================================

CREATE TABLE public.certificate_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  settings    jsonb NOT NULL DEFAULT '{}',
  is_default  boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage certificate templates"
  ON public.certificate_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
CREATE POLICY "Anyone can view certificate templates"
  ON public.certificate_templates FOR SELECT USING (true);

-- Link courses to a specific template
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_id uuid
  REFERENCES public.certificate_templates(id) ON DELETE SET NULL;

-- Track which template was used when a cert was generated
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS template_id uuid
  REFERENCES public.certificate_templates(id) ON DELETE SET NULL;
