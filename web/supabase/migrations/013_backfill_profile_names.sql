-- ============================================================
-- 013 — Backfill profiles.full_name from auth.users metadata
--       for users where the profile row has no name yet
--       (e.g. invited via magic-link before they set one)
-- ============================================================

UPDATE public.profiles p
SET full_name = u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
WHERE p.id = u.id
  AND (p.full_name IS NULL OR p.full_name = '')
  AND (u.raw_user_meta_data ->> 'full_name') IS NOT NULL
  AND (u.raw_user_meta_data ->> 'full_name') <> '';

-- Keep future sign-ups in sync: update name on every auth event too
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, interests, role, email)
  VALUES (
    new.id,
    NULLIF(TRIM(new.raw_user_meta_data ->> 'full_name'), ''),
    new.raw_user_meta_data ->> 'user_type',
    array(SELECT jsonb_array_elements_text(new.raw_user_meta_data -> 'interests')),
    'learner',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(
      NULLIF(TRIM(EXCLUDED.full_name), ''),
      NULLIF(TRIM(public.profiles.full_name), '')
    ),
    user_type = EXCLUDED.user_type,
    interests = EXCLUDED.interests,
    email     = EXCLUDED.email;
  RETURN new;
END;
$$;
