-- ============================================================
-- 007 — Notifications, audit logs, email logs, support, saved
-- Requires: 002, 004, 005, 006
-- ============================================================

-- Notifications
CREATE TABLE public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  body            text,
  action_url      text,
  status          notification_status NOT NULL DEFAULT 'unread',
  notification_type text NOT NULL DEFAULT 'general',
  related_course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  related_order_id  uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can insert notifications for any user"
  ON public.notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Audit logs (append-only)
CREATE TABLE public.audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        uuid REFERENCES public.profiles(id),
  action          text NOT NULL,
  table_name      text NOT NULL,
  record_id       uuid,
  old_values      jsonb,
  new_values      jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  ));
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Email logs
CREATE TABLE public.email_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  template        text NOT NULL,
  subject         text,
  status          text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  provider_id     text,
  sent_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins view email logs"
  ON public.email_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  ));
CREATE POLICY "Service role can insert email logs"
  ON public.email_logs FOR INSERT WITH CHECK (true);

-- Support tickets
CREATE TABLE public.support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email           text NOT NULL,
  subject         text NOT NULL,
  body            text NOT NULL,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority        text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to     uuid REFERENCES public.profiles(id),
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and create own tickets"
  ON public.support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert tickets"
  ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage all tickets"
  ON public.support_tickets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Saved / bookmarked courses
CREATE TABLE public.saved_courses (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  saved_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved courses"
  ON public.saved_courses FOR ALL USING (user_id = auth.uid());

-- Content feedback / ratings
CREATE TABLE public.course_ratings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  is_public   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ratings"
  ON public.course_ratings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone can view public ratings"
  ON public.course_ratings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins manage all ratings"
  ON public.course_ratings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('content_admin','platform_admin')
  ));

-- Useful indexes
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_course ON public.lesson_progress(user_id, course_id);
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category_id);
