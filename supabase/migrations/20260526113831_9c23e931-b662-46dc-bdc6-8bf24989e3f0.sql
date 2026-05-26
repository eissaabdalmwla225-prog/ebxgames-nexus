
-- 1. Remove residual public screenshot policy
DROP POLICY IF EXISTS "Screenshots are publicly viewable" ON storage.objects;

-- 2. Restrict profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- 3. Column-level revoke on video_url
REVOKE SELECT (video_url) ON public.media FROM anon, authenticated;
REVOKE SELECT (video_url) ON public.episodes FROM anon, authenticated;
GRANT SELECT (id, type, title, description, poster_url, backdrop_url, category, year, price, is_free, is_active, sort_order, created_at, updated_at)
  ON public.media TO anon, authenticated;
GRANT SELECT (id, media_id, season, episode_number, title, description, duration, thumbnail_url, created_at)
  ON public.episodes TO anon, authenticated;

-- 4. Secure RPC for video URLs
CREATE OR REPLACE FUNCTION public.get_video_url(_media_id uuid, _episode_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m_is_free boolean;
  m_video text;
  ep_video text;
  uid uuid := auth.uid();
  email text := (auth.jwt() ->> 'email');
BEGIN
  SELECT is_free, video_url INTO m_is_free, m_video FROM public.media WHERE id = _media_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  IF NOT m_is_free THEN
    IF uid IS NULL THEN RETURN NULL; END IF;
    IF NOT public.is_admin(email)
       AND NOT EXISTS (
         SELECT 1 FROM public.purchases
         WHERE user_id = uid AND media_id = _media_id
           AND status IN ('active','completed','paid','succeeded')
       )
    THEN
      RETURN NULL;
    END IF;
  END IF;

  IF _episode_id IS NOT NULL THEN
    SELECT video_url INTO ep_video FROM public.episodes
      WHERE id = _episode_id AND media_id = _media_id;
    RETURN ep_video;
  END IF;

  RETURN m_video;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_video_url(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_video_url(uuid, uuid) TO anon, authenticated;

-- 5. Lock down internal SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated;
