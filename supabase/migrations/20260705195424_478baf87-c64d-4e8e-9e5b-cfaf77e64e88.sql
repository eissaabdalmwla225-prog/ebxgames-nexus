
-- Revoke direct SELECT on sensitive video/stream URL columns
REVOKE SELECT (video_url) ON public.media FROM anon, authenticated;
REVOKE SELECT (video_url) ON public.episodes FROM anon, authenticated;
REVOKE SELECT (stream_url) ON public.streams FROM anon, authenticated;

-- Security-definer RPC to obtain a stream URL (routes access through a controlled function)
CREATE OR REPLACE FUNCTION public.get_stream_url(_stream_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s_url text;
  s_active boolean;
BEGIN
  SELECT stream_url, is_active INTO s_url, s_active FROM public.streams WHERE id = _stream_id;
  IF NOT FOUND OR NOT s_active THEN RETURN NULL; END IF;
  RETURN s_url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_stream_url(uuid) TO anon, authenticated;

-- Fix conflicting storage INSERT policy on order-screenshots bucket:
-- drop the broad policy so only the strict user-folder policy remains.
DROP POLICY IF EXISTS "Users can upload order screenshots" ON storage.objects;
