-- ============================================================
-- 019 — Newsletter subscribers (footer form + exit-intent popup)
-- ============================================================

CREATE TABLE public.newsletter_subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text CHECK (char_length(name) <= 120),
  email            text NOT NULL,
  email_norm       text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  source           text CHECK (char_length(source) <= 60),
  status           text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  subscribed_at    timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at  timestamptz,
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email_norm)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  ));
