-- ============================================================
-- 011 — Add email column to profiles, sync from auth.users
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Back-fill existing rows from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id;

-- Keep email in sync when new users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, interests, role, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'user_type',
    array(SELECT jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')),
    'learner',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    interests = EXCLUDED.interests,
    email     = EXCLUDED.email;
  RETURN new;
END;
$$;
