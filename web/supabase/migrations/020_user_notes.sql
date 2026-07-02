-- ============================================================
-- 020 — Admin notes on user profiles
-- ============================================================

CREATE TABLE public.user_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note        text NOT NULL CHECK (char_length(note) <= 4000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage user notes"
  ON public.user_notes FOR ALL
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
