-- games
DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
CREATE POLICY "Active games are viewable" ON public.games FOR SELECT
USING (is_active = true OR public.is_admin((auth.jwt() ->> 'email')));

-- game_packages
DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.game_packages;
CREATE POLICY "Packages of active games are viewable" ON public.game_packages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_packages.game_id AND g.is_active = true)
       OR public.is_admin((auth.jwt() ->> 'email')));

-- media
DROP POLICY IF EXISTS "Media viewable by everyone" ON public.media;
CREATE POLICY "Active media viewable" ON public.media FOR SELECT
USING (is_active = true OR public.is_admin((auth.jwt() ->> 'email')));

-- episodes
DROP POLICY IF EXISTS "Episodes viewable by everyone" ON public.episodes;
CREATE POLICY "Episodes of active media viewable" ON public.episodes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.media m WHERE m.id = episodes.media_id AND m.is_active = true)
       OR public.is_admin((auth.jwt() ->> 'email')));

-- ads
DROP POLICY IF EXISTS "Ads are viewable by everyone" ON public.ads;
CREATE POLICY "Active scheduled ads viewable" ON public.ads FOR SELECT
USING ((is_active = true
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at >= now()))
       OR public.is_admin((auth.jwt() ->> 'email')));

-- video_ads
DROP POLICY IF EXISTS "Video ads viewable by everyone" ON public.video_ads;
CREATE POLICY "Active video ads viewable" ON public.video_ads FOR SELECT
USING (is_active = true OR public.is_admin((auth.jwt() ->> 'email')));

-- reviews
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews of active media viewable" ON public.reviews FOR SELECT
USING (EXISTS (SELECT 1 FROM public.media m WHERE m.id = reviews.media_id AND m.is_active = true)
       OR auth.uid() = user_id
       OR public.is_admin((auth.jwt() ->> 'email')));

-- site_settings: only public (non-secret) keys readable by clients
DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
CREATE POLICY "Public site settings viewable" ON public.site_settings FOR SELECT
USING ((key NOT LIKE 'private\_%' AND key NOT LIKE 'secret\_%' AND key NOT LIKE '%\_secret' AND key NOT LIKE '%\_key')
       OR public.is_admin((auth.jwt() ->> 'email')));

-- profiles: own profile, or profiles of users who posted a public review
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users view own or reviewer profiles" ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id
       OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.user_id = profiles.user_id)
       OR public.is_admin((auth.jwt() ->> 'email')));

-- storage: public buckets keep public URL downloads; remove unrestricted listing policies
DROP POLICY IF EXISTS "Posters publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;