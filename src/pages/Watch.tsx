import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import ReviewsSection from "@/components/ReviewsSection";
import { useMediaItem, useEpisodes, type Episode } from "@/hooks/useMedia";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: media, isLoading } = useMediaItem(id);
  const { data: episodes = [] } = useEpisodes(media?.type === "series" ? id : undefined);
  const [activeEp, setActiveEp] = useState<Episode | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  const targetEpisodeId = media?.type === "series" ? (activeEp?.id || episodes[0]?.id) : undefined;

  useEffect(() => {
    if (!media) return;
    if (!media.is_free) { setPlayUrl(null); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_video_url", {
        _media_id: media.id,
        _episode_id: targetEpisodeId ?? undefined,
      } as any);
      if (cancelled) return;
      if (error) { setPlayUrl(null); return; }
      setPlayUrl((data as string) || null);
    })();
    return () => { cancelled = true; };
  }, [media?.id, media?.is_free, targetEpisodeId]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!media) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Not found</div>;

  const isLocked = !media.is_free;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 glass-card backdrop-blur-2xl border-b border-glass-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <h2 className="font-display text-sm font-bold text-foreground truncate">{media.title}</h2>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <AdBanner placement="watch-top" />
        {isLocked ? (
          <div className="aspect-video rounded-2xl glass-card border border-glass-border flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Lock className="w-10 h-10 text-primary" />
            <p className="font-display text-lg font-bold text-foreground">${Number(media.price).toFixed(2)} to watch</p>
            <p className="text-sm text-muted-foreground max-w-sm">Paid checkout will be available once Stripe is enabled. Ask the admin to enable payments.</p>
            <button onClick={() => toast.info("Stripe checkout coming soon")} className="px-6 py-2.5 rounded-xl btn-glow text-primary-foreground text-sm font-bold">Buy access</button>
          </div>
        ) : playUrl ? (
          <VideoPlayer
            url={playUrl}
            poster={media.backdrop_url || media.poster_url || undefined}
            mediaId={media.id}
            episodeId={targetEpisodeId ?? null}
          />

        ) : (
          <div className="aspect-video rounded-2xl glass-card flex items-center justify-center text-muted-foreground">No video yet</div>
        )}

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-black text-foreground">{media.title}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{media.year} · {media.category} · {media.type}</p>
          {media.description && <p className="text-sm text-muted-foreground leading-relaxed">{media.description}</p>}
        </div>

        {media.type === "series" && episodes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-foreground">Episodes</h3>
            <div className="space-y-2">
              {episodes.map((ep) => (
                <button key={ep.id} onClick={() => setActiveEp(ep)}
                  className={`w-full text-left glass-card p-3 rounded-xl flex items-center gap-3 hover:border-primary/40 transition-all ${activeEp?.id === ep.id ? "border-primary" : ""}`}>
                  <Play className="w-4 h-4 text-primary fill-current shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">S{ep.season}E{ep.episode_number}</p>
                    <p className="font-display text-sm font-bold text-foreground truncate">{ep.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <AdBanner placement="watch-footer" />
      </div>
      <BottomNav />
    </div>
  );
};

export default Watch;
