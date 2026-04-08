
-- Add screenshot_url to orders
ALTER TABLE public.orders ADD COLUMN screenshot_url text;

-- Create storage bucket for order screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('order-screenshots', 'order-screenshots', true);

-- Users can upload their own screenshots
CREATE POLICY "Users can upload order screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-screenshots');

-- Public read access for screenshots
CREATE POLICY "Screenshots are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-screenshots');
