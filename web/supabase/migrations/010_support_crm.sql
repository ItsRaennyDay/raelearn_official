-- ============================================================
-- 010 — Support ticket CRM: ticket IDs, names, admin notes
-- Requires: 007
-- ============================================================

ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS ticket_id   text UNIQUE;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS submitter_name text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category   text NOT NULL DEFAULT 'general'
  CHECK (category IN ('general','course_help','billing','group_account','custom_training','other'));

CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := 'RL-' || LPAD(nextval('support_ticket_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_id
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_id();

CREATE INDEX IF NOT EXISTS idx_support_tickets_status     ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id  ON public.support_tickets(ticket_id);
