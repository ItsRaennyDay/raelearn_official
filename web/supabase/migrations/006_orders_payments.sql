-- ============================================================
-- 006 — Orders, payment events, coupons, bundles
-- Requires: 002, 004, 005
-- ============================================================

-- Coupons
CREATE TABLE public.coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  discount_type   discount_type NOT NULL DEFAULT 'percent',
  discount_value  numeric(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses        int,
  uses_count      int NOT NULL DEFAULT 0,
  valid_from      timestamptz NOT NULL DEFAULT now(),
  valid_until     timestamptz,
  applies_to      text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','course','organization')),
  course_id       uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  created_by      uuid REFERENCES public.profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));
CREATE POLICY "Anyone can look up a coupon code"
  ON public.coupons FOR SELECT USING (
    valid_from <= now()
    AND (valid_until IS NULL OR valid_until > now())
    AND (max_uses IS NULL OR uses_count < max_uses)
  );

-- Course bundles
CREATE TABLE public.bundles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  price_cents     int NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  status          course_status NOT NULL DEFAULT 'draft',
  created_by      uuid REFERENCES public.profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published bundles"
  ON public.bundles FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage bundles"
  ON public.bundles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

CREATE TABLE public.bundle_courses (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, course_id)
);
ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bundle courses" ON public.bundle_courses FOR SELECT USING (true);

-- Orders
CREATE TABLE public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
  status          order_status NOT NULL DEFAULT 'pending',
  subtotal_cents  int NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  discount_cents  int NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents     int NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  coupon_id       uuid REFERENCES public.coupons(id),
  stripe_session_id text,
  stripe_payment_intent_id text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage all orders"
  ON public.orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin')
  ));

CREATE TABLE public.order_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  course_id       uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  bundle_id       uuid REFERENCES public.bundles(id) ON DELETE SET NULL,
  quantity        int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents int NOT NULL DEFAULT 0 CHECK (unit_price_cents >= 0),
  CHECK (
    (course_id IS NOT NULL AND bundle_id IS NULL) OR
    (course_id IS NULL AND bundle_id IS NOT NULL)
  )
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()
  ));
CREATE POLICY "Admins manage all order items"
  ON public.order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin')
  ));

-- Payment events (webhook log)
CREATE TABLE public.payment_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid REFERENCES public.orders(id),
  stripe_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  payload         jsonb,
  processed_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view payment events"
  ON public.payment_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin')
  ));

-- Add FK from enrollments to orders (deferred from 004)
ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
