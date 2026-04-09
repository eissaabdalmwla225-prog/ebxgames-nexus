
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL DEFAULT 'banner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ads are viewable by everyone"
ON public.ads FOR SELECT USING (true);

CREATE POLICY "Admins can insert ads"
ON public.ads FOR INSERT
WITH CHECK ((auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails));

CREATE POLICY "Admins can update ads"
ON public.ads FOR UPDATE
USING ((auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails));

CREATE POLICY "Admins can delete ads"
ON public.ads FOR DELETE
USING ((auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails));

CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
