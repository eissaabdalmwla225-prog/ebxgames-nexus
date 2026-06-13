ALTER TABLE public.video_ads ADD COLUMN IF NOT EXISTS stream_id uuid REFERENCES public.streams(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_video_ads_stream ON public.video_ads(stream_id);