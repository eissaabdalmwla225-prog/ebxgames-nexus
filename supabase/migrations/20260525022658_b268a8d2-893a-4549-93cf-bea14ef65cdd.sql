
-- Create media table (movies and series)
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  category TEXT DEFAULT 'Other',
  year INTEGER,
  video_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media viewable by everyone" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admins manage media insert" ON public.media FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins manage media update" ON public.media FOR UPDATE TO authenticated USING (public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins manage media delete" ON public.media FOR DELETE TO authenticated USING (public.is_admin(auth.jwt() ->> 'email'));
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Episodes for series
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 1,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Episodes viewable by everyone" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Admins insert episodes" ON public.episodes FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins update episodes" ON public.episodes FOR UPDATE TO authenticated USING (public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins delete episodes" ON public.episodes FOR DELETE TO authenticated USING (public.is_admin(auth.jwt() ->> 'email'));

-- Leagues
CREATE TABLE public.leagues (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  logo_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leagues viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Admins manage leagues" ON public.leagues FOR ALL TO authenticated USING (public.is_admin(auth.jwt() ->> 'email')) WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

-- Matches
CREATE TABLE public.matches (
  id BIGINT PRIMARY KEY,
  league_id INTEGER REFERENCES public.leagues(id) ON DELETE SET NULL,
  league_name TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'NS',
  home_score INTEGER,
  away_score INTEGER,
  stream_url TEXT,
  ai_insight TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL TO authenticated USING (public.is_admin(auth.jwt() ->> 'email')) WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

-- Purchases
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id, status)
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Service inserts purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Service updates purchases" ON public.purchases FOR UPDATE USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('media-posters', 'media-posters', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media-videos', 'media-videos', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Posters publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'media-posters');
CREATE POLICY "Admins upload posters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-posters' AND public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins update posters" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media-posters' AND public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins delete posters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media-posters' AND public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-videos' AND public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins update videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media-videos' AND public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins delete videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media-videos' AND public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins read videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media-videos' AND public.is_admin(auth.jwt() ->> 'email'));

-- Seed featured leagues
INSERT INTO public.leagues (id, name, country, is_featured) VALUES
  (39, 'Premier League', 'England', true),
  (140, 'La Liga', 'Spain', true),
  (135, 'Serie A', 'Italy', true),
  (78, 'Bundesliga', 'Germany', true),
  (61, 'Ligue 1', 'France', true),
  (2, 'UEFA Champions League', 'World', true),
  (3, 'UEFA Europa League', 'World', true)
ON CONFLICT DO NOTHING;
