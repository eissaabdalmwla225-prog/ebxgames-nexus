
-- Drop the partially created tables from failed migration
DROP TABLE IF EXISTS public.game_packages CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.admin_emails CASCADE;

-- Admin emails allowlist (must be first - referenced by other policies)
CREATE TABLE public.admin_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin list" ON public.admin_emails FOR SELECT USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can insert admin emails" ON public.admin_emails FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can delete admin emails" ON public.admin_emails FOR DELETE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);

-- Games table
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text,
  category text NOT NULL DEFAULT 'Other',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Admins can insert games" ON public.games FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can update games" ON public.games FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can delete games" ON public.games FOR DELETE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Game packages table
CREATE TABLE public.game_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL,
  price numeric NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.game_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Packages are viewable by everyone" ON public.game_packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert packages" ON public.game_packages FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can update packages" ON public.game_packages FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can delete packages" ON public.game_packages FOR DELETE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);

-- Site settings key-value store
CREATE TABLE public.site_settings (
  key text NOT NULL PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_emails)
);
