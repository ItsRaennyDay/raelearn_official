-- ============================================================
-- 005 — Organizations, memberships, invites, course assignments
-- Requires: 002, 004
-- ============================================================

CREATE TABLE public.organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  owner_id        uuid NOT NULL REFERENCES public.profiles(id),
  seat_count      int NOT NULL DEFAULT 5 CHECK (seat_count > 0),
  seats_used      int NOT NULL DEFAULT 0 CHECK (seats_used >= 0),
  subscription_expires_at timestamptz,
  logo_url        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view their org"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );
CREATE POLICY "Org owners can update their org"
  ON public.organizations FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Admins manage all orgs"
  ON public.organizations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin')
  ));

CREATE TABLE public.organization_memberships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  status          org_membership_status NOT NULL DEFAULT 'invited',
  invited_by      uuid REFERENCES public.profiles(id),
  joined_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their own memberships"
  ON public.organization_memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Org admins can view all memberships in their org"
  ON public.organization_memberships FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organization_memberships om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = organization_memberships.organization_id
      AND (om.user_id = auth.uid() AND om.role = 'admin' OR o.owner_id = auth.uid())
      AND om.status = 'active'
  ));
CREATE POLICY "Org admins can manage memberships"
  ON public.organization_memberships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_memberships om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = organization_memberships.organization_id
      AND (om.user_id = auth.uid() AND om.role = 'admin' OR o.owner_id = auth.uid())
      AND om.status = 'active'
  ));
CREATE POLICY "Platform admins manage all memberships"
  ON public.organization_memberships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'platform_admin'
  ));

CREATE TABLE public.organization_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email           text NOT NULL,
  email_norm      text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  token           text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  invited_by      uuid NOT NULL REFERENCES public.profiles(id),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins can manage invites"
  ON public.organization_invites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_memberships om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = organization_invites.organization_id
      AND (om.user_id = auth.uid() AND om.role = 'admin' OR o.owner_id = auth.uid())
      AND om.status = 'active'
  ));
CREATE POLICY "Anyone can view invite by token for acceptance"
  ON public.organization_invites FOR SELECT USING (accepted_at IS NULL AND expires_at > now());

CREATE TABLE public.organization_course_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_by     uuid NOT NULL REFERENCES public.profiles(id),
  assigned_at     timestamptz NOT NULL DEFAULT now(),
  due_date        timestamptz,
  UNIQUE(organization_id, course_id)
);
ALTER TABLE public.organization_course_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view course assignments"
  ON public.organization_course_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE organization_id = organization_course_assignments.organization_id
      AND user_id = auth.uid()
      AND status = 'active'
  ));
CREATE POLICY "Org admins can manage course assignments"
  ON public.organization_course_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_memberships om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = organization_course_assignments.organization_id
      AND (om.user_id = auth.uid() AND om.role = 'admin' OR o.owner_id = auth.uid())
      AND om.status = 'active'
  ));

-- Add FK constraints deferred from 004
ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
