
DROP POLICY IF EXISTS "Service inserts purchases" ON public.purchases;
DROP POLICY IF EXISTS "Service updates purchases" ON public.purchases;
CREATE POLICY "Admins insert purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));
CREATE POLICY "Admins update purchases" ON public.purchases FOR UPDATE TO authenticated USING (public.is_admin(auth.jwt() ->> 'email'));
