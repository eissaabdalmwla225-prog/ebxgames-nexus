
-- Admin-managed bottom nav items
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL,
  icon text NOT NULL DEFAULT 'Film',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT ALL ON public.nav_items TO authenticated, service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_items public read" ON public.nav_items FOR SELECT USING (is_active = true OR public.is_admin((auth.jwt() ->> 'email')));
CREATE POLICY "nav_items admin write" ON public.nav_items FOR ALL
  USING (public.is_admin((auth.jwt() ->> 'email')))
  WITH CHECK (public.is_admin((auth.jwt() ->> 'email')));
CREATE TRIGGER trg_nav_items_updated BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Live streams (manual)
CREATE TABLE public.streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  stream_url text NOT NULL,
  stream_type text NOT NULL DEFAULT 'iframe', -- 'iframe' | 'hls' | 'mp4' | 'youtube'
  category text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_live boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.streams TO anon, authenticated;
GRANT ALL ON public.streams TO authenticated, service_role;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streams public read" ON public.streams FOR SELECT USING (is_active = true OR public.is_admin((auth.jwt() ->> 'email')));
CREATE POLICY "streams admin write" ON public.streams FOR ALL
  USING (public.is_admin((auth.jwt() ->> 'email')))
  WITH CHECK (public.is_admin((auth.jwt() ->> 'email')));
CREATE TRIGGER trg_streams_updated BEFORE UPDATE ON public.streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default nav items so the bar still works
INSERT INTO public.nav_items (label, path, icon, sort_order) VALUES
  ('Home', '/', 'Home', 0),
  ('Movies', '/movies', 'Film', 1),
  ('Series', '/series', 'Tv', 2),
  ('Live', '/live', 'Radio', 3);
