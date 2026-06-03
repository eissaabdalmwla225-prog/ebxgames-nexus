# Plan

A large feature set across UI, admin, and database. Breaking into clear phases.

## 1. Media Card Redesign (`MediaCard.tsx`, `MediaList.tsx`, `Index.tsx` rows)
- Move title **below** the poster image (no more bottom overlay).
- Increase card size: change grids from current sm sizes to larger (e.g. `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` with bigger gaps); rows on home use wider `min-w` per item.
- Title text larger, year/category as small caption underneath.
- Keep FREE/PRICE chip on poster.

## 2. Faster Video Uploads + Live % Progress
- New `useVideoUpload` hook using `supabase.storage.from('media-videos').uploadToSignedUrl` flow OR direct `upload` with `onUploadProgress` via XHR (Supabase JS doesn't expose progress, so use a manual XHR PUT to a signed upload URL — fastest + gives real progress).
- Flow: client calls `createSignedUploadUrl(path)` → XHR PUT file with `xhr.upload.onprogress` → returns final path → store as `video_url` (signed playback URL or public path resolved through existing `get_video_url` RPC).
- Show progress bar + percentage in `AdminMedia` and episode form.
- Increase concurrency/no transformations for speed; recommend mp4 directly.

## 3. Ratings & Reviews (DB + UI)
- New table `reviews`: `id, media_id, user_id, rating (1-5), comment, created_at, updated_at`. Unique `(media_id, user_id)`.
- RLS: anyone authenticated can insert/update their own; everyone can SELECT; admins can delete.
- GRANTs for anon SELECT, authenticated CRUD on own row.
- `useReviews(mediaId)` hook + `ReviewsSection` component on `Watch.tsx` with star picker + comment textarea + list of reviews with avatars + average rating display.
- Show average rating + count on `MediaCard` (small star + number).

## 4. Bulk Episodes for Series (admin)
- In `AdminMedia` episode editor for a series, add **"Bulk add"** mode:
  - Textarea where each line = `Title | video_url | duration?` OR multi-row form with "+ Add row" button.
  - Multi-file picker that uploads all selected videos in parallel, auto-creating episodes numbered sequentially from last episode_number + 1.
  - Per-file progress bars.
- Single insert with array payload.

## 5. In-Stream Ads with Skip Timer (the big one)
- New table `video_ads`:
  - `id, media_id (nullable), episode_id (nullable), ad_type ('link'|'embed'|'video'), ad_url, embed_code, video_url, click_url, start_at_seconds (int, when in playback to trigger), skip_after_seconds (int, default 5), duration_seconds (int), is_active, sort_order, created_at`.
  - At least one of `media_id` or `episode_id` set (or both null = global pre-roll).
- RLS: public SELECT active; admin full CRUD. GRANTs accordingly.
- New `AdminMediaAds` panel inside the media edit screen → list/add/edit timed ads per movie/episode.
- `VideoPlayer.tsx` enhancement:
  - Accept `mediaId` / `episodeId` props.
  - Fetch ads for that content, sort by `start_at_seconds`.
  - Track playback time (ReactPlayer `onProgress`).
  - When current time ≥ next ad's `start_at_seconds` and not yet shown, pause main video and overlay ad:
    - `video` type → second ReactPlayer playing ad video
    - `embed` type → `iframe srcDoc`
    - `link` type → image/banner with click-through
  - Overlay shows countdown: "Skip in N…" then **Skip Ad** button after `skip_after_seconds`. Auto-resume when ad ends (or skip pressed).
- For iframe-embedded sources (where we can't control playback), render ads as full pre-roll only.

## 6. Platform-Wide Paid Ads (extend existing `ads` system)
- Extend `PLACEMENTS` in `AdminAds`:
  - `library-top`, `library-between`, `profile-top`, `auth-top`, `sidebar`, `floating-bottom`.
- Add `<AdBanner placement="..." />` mounts on `MediaList.tsx`, `Profile.tsx`, `Auth.tsx` (top), and a dismissible floating banner on `Index.tsx`.
- Add `is_paid` boolean + `priority` int (already have `sort_order`) — keep it simple, reuse `sort_order` for priority.

## 7. QA / Wiring
- Update `src/integrations/supabase/types.ts` is auto-managed (don't touch).
- Verify build, check Watch page playback, admin flows.

## Technical notes
- All HSL semantic tokens preserved; no raw colors.
- Use `@tanstack/react-query` for new hooks (matches repo style).
- Use existing `sonner` toasts for upload feedback.
- `framer-motion` for ad overlay fade.

## Files to change
**Create**
- `supabase/migrations/<new>.sql` (reviews + video_ads tables)
- `src/hooks/useVideoUpload.ts`
- `src/hooks/useReviews.ts`
- `src/components/ReviewsSection.tsx`
- `src/components/VideoUploadField.tsx` (reusable: file input + progress bar + URL fallback)
- `src/components/admin/AdminMediaAds.tsx`
- `src/components/admin/AdminBulkEpisodes.tsx`

**Edit**
- `src/components/MediaCard.tsx` — title below, larger
- `src/pages/Index.tsx`, `src/pages/MediaList.tsx` — grid sizes, ad slots
- `src/pages/Profile.tsx`, `src/pages/Auth.tsx` — ad slots
- `src/pages/Watch.tsx` — ReviewsSection + pass ids to VideoPlayer
- `src/components/VideoPlayer.tsx` — in-stream ads + skip
- `src/components/admin/AdminMedia.tsx` — VideoUploadField, bulk episodes button, per-media ads tab
- `src/components/admin/AdminAds.tsx` — new placements

Confirm and I'll execute.