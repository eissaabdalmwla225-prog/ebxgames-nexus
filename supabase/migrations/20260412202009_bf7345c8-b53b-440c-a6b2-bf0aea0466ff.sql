
-- Create a security definer function to check admin status without recursive RLS
CREATE OR REPLACE FUNCTION public.is_admin(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails WHERE email = _email
  )
$$;

-- Drop old recursive RLS policies on admin_emails
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_emails;
DROP POLICY IF EXISTS "Admins can insert admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Admins can delete admin emails" ON public.admin_emails;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view admin list"
ON public.admin_emails FOR SELECT
TO authenticated
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can insert admin emails"
ON public.admin_emails FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete admin emails"
ON public.admin_emails FOR DELETE
TO authenticated
USING (public.is_admin(auth.jwt() ->> 'email'));
