
-- Add status and admin_note to orders
ALTER TABLE public.orders ADD COLUMN status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN admin_note text;

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING ((auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails));

-- Allow admins to update orders (status changes)
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING ((auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails));

-- Create storage bucket for site assets (logos, game images)
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' 
  AND (auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails)
);

CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets'
  AND (auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails)
);

CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets'
  AND (auth.jwt() ->> 'email'::text) IN (SELECT email FROM admin_emails)
);
