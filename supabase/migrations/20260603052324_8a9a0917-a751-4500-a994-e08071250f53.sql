-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, user_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert their own review"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review or admins"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin((auth.jwt() ->> 'email')));

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_reviews_media ON public.reviews(media_id);

-- Video Ads table (in-stream)
CREATE TABLE public.video_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid,
  episode_id uuid,
  title text NOT NULL DEFAULT 'Ad',
  ad_type text NOT NULL DEFAULT 'link' CHECK (ad_type IN ('link','embed','video')),
  image_url text,
  embed_code text,
  video_url text,
  click_url text,
  start_at_seconds int NOT NULL DEFAULT 0,
  skip_after_seconds int NOT NULL DEFAULT 5,
  duration_seconds int NOT NULL DEFAULT 15,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.video_ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_ads TO authenticated;
GRANT ALL ON public.video_ads TO service_role;

ALTER TABLE public.video_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Video ads viewable by everyone"
  ON public.video_ads FOR SELECT USING (true);

CREATE POLICY "Admins insert video ads"
  ON public.video_ads FOR INSERT TO authenticated
  WITH CHECK (public.is_admin((auth.jwt() ->> 'email')));

CREATE POLICY "Admins update video ads"
  ON public.video_ads FOR UPDATE TO authenticated
  USING (public.is_admin((auth.jwt() ->> 'email')));

CREATE POLICY "Admins delete video ads"
  ON public.video_ads FOR DELETE TO authenticated
  USING (public.is_admin((auth.jwt() ->> 'email')));

CREATE TRIGGER trg_video_ads_updated_at
  BEFORE UPDATE ON public.video_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_video_ads_media ON public.video_ads(media_id);
CREATE INDEX idx_video_ads_episode ON public.video_ads(episode_id);