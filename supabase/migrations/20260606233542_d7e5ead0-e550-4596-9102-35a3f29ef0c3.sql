
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS ad_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS embed_code text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS html_content text;
