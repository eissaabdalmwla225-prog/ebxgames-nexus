# EBX LV — Streaming Platform Rewrite

Transform the current top-up store into **EBX LV**, a platform for movies, TV series, and live football streams, with AI-assisted fixtures and Stripe checkout.

## What gets removed
- Games, game packages, orders, promo flow, screenshot upload checkout
- Game admin tabs
- Old hero/branding ("EBX Games")

## What gets built

### 1. Branding → "EBX LV"
- Update `index.html` title, meta, OG tags
- Update logo/hero copy, footer, public/llms.txt, README
- New tagline ("Movies. Series. Live football. — EBX LV")

### 2. New database schema (migration)
```
media               movies + series root (type: 'movie' | 'series')
  - title, description, poster_url, backdrop_url, category, year
  - video_url (movies only, nullable)
  - price (numeric, 0 = free), is_free
  - is_active, sort_order
episodes            for series
  - media_id, season, episode_number, title, video_url, duration
leagues             cached football leagues
matches             cached fixtures + admin-overridable stream link
  - league_id, home_team, away_team, kickoff_at, status, stream_url
purchases           records of paid access (replaces orders)
  - user_id, media_id, stripe_session_id, amount, status
```
RLS: media/episodes/leagues/matches readable by all; admin write-only.
Purchases: users see own, admins see all.

### 3. Storage
- New public bucket `media-posters` (images)
- New private bucket `media-videos` (MP4 uploads) with signed-URL playback gated by purchase/free status
- Drop dependence on `order-screenshots`

### 4. Admin dashboard (rewrite tabs)
- **Library**: list/add/edit movies & series; upload poster + video (or paste URL); set title, description, category, price, free toggle
- **Episodes**: under a series, add seasons/episodes
- **Live**: list AI-suggested upcoming matches, edit/attach a stream URL per match, toggle "live now"
- **Ads** + **Admins** + **Settings**: keep
- Remove Games, Orders tabs

### 5. Public site
- `/` Home — hero, featured rows (Trending / Movies / Series / Live tonight)
- `/movies`, `/series` — grid + filters
- `/live` — football schedule grouped by league/day, "watch live" CTA when match is live
- `/watch/:mediaId` (and `/watch/:mediaId/:episodeId`) — video player (HLS/MP4/YouTube embed auto-detect), paywall if priced
- `/match/:matchId` — embedded live player
- Bottom nav: Home, Movies, Series, Live, Profile (+ Admin if admin)

### 6. Payments — Stripe (Lovable seamless)
- Enable via `enable_stripe_payments` (no Stripe account needed)
- One-time purchase per movie/series: "Buy access" → Stripe Checkout → webhook records purchase → user gets permanent access
- Free items skip checkout

### 7. Football AI integration
- Secret: `API_FOOTBALL_KEY` (api-football.com / RapidAPI free tier)
- Edge function `sync-fixtures`: pulls today + next 7 days for major leagues (PL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL) into `matches`
- Edge function `ai-match-insights`: uses Lovable AI Gemini to generate short pre-match blurbs shown on match cards
- Admin clicks "Refresh fixtures" to trigger sync; matches with `stream_url` show "Watch Live" button

## Order of execution
1. Create DB migration (new tables, drop policies on old ones we stop using — keep tables to avoid data loss; just hide from UI)
2. Create storage buckets via migration
3. Enable Stripe seamless payments
4. Ask for `API_FOOTBALL_KEY` secret
5. Edge functions: `create-checkout`, `stripe-webhook`, `sync-fixtures`, `ai-match-insights`
6. Frontend: rebrand, new pages, new admin, video player component, bottom nav update
7. Remove/hide game UI

## Technical notes
- Video player: `react-player` (supports YouTube, MP4, HLS)
- Paywall check: query `purchases` for current user + media_id; if `is_free` or purchased → signed video URL; else show buy button
- Old `games`, `game_packages`, `orders` tables left in DB but no UI references (safer than destructive drop)
- Auth stays as-is (email/password + Google already configured)

This is a large multi-step build. Approving this plan kicks off DB migration first, then Stripe enable + API key request, then code.