
-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'order-screenshots';

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on order-screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to order-screenshots" ON storage.objects;

-- SELECT: owner or admin
CREATE POLICY "Owner or admin can view order screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-screenshots'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_emails)
  )
);

-- INSERT: authenticated users upload only to their own folder
CREATE POLICY "Users upload to own folder in order-screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: own folder only
CREATE POLICY "Users update own order screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'order-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: own folder only
CREATE POLICY "Users delete own order screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
