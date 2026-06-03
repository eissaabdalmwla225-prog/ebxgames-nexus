import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { X, SkipForward, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface VideoAd {
  id: string;
  title: string;
  ad_type: "link" | "embed" | "video";
  image_url: string | null;
  embed_code: string | null;
  video_url: string | null;
  click_url: string | null;
  start_at_seconds: number;
  skip_after_seconds: number;
  duration_seconds: number;
  sort_order: number;
}

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
  mediaId?: string;
  episodeId?: string | null;
}

const isEmbedHtml = (s: string) => /<\s*(iframe|script|embed|video)/i.test(s);
const isDirectMedia = (url: string) => /\.(mp4|m3u8|webm|mov|mkv|ogv)(\?|$)/i.test(url);
const isNativeStreamHost = (url: string) =>
  /(youtube\.com|youtu\.be|vimeo\.com|soundcloud\.com|twitch\.tv|facebook\.com\/.+\/videos|wistia\.com|dailymotion\.com|mixcloud\.com|kick\.com)/i.test(
    url,
  );

const useVideoAds = (mediaId?: string, episodeId?: string | null) => {
  return useQuery({
    queryKey: ["video-ads", mediaId, episodeId],
    enabled: !!mediaId,
    queryFn: async () => {
      let q = supabase
        .from("video_ads")
        .select("*")
        .eq("is_active", true)
        .order("start_at_seconds");
      if (episodeId) {
        q = q.or(`media_id.eq.${mediaId},episode_id.eq.${episodeId}`);
      } else {
        q = q.eq("media_id", mediaId!);
      }
      const { data, error } = await q;
      if (error) throw error;
      // Episode-specific overrides when present
      const rows = (data || []) as VideoAd[];
      return episodeId
        ? rows.filter((r: any) => r.episode_id === episodeId || (r.media_id === mediaId && !r.episode_id))
        : rows;
    },
    staleTime: 60_000,
  });
};

const VideoPlayer = ({ url, poster, autoPlay = true, mediaId, episodeId }: VideoPlayerProps) => {
  const src = (url || "").trim();
  const { data: ads = [] } = useVideoAds(mediaId, episodeId);

  // Sort, dedupe by start time
  const sortedAds = useMemo(
    () => [...ads].sort((a, b) => a.start_at_seconds - b.start_at_seconds || a.sort_order - b.sort_order),
    [ads],
  );

  const [shownAdIds, setShownAdIds] = useState<Set<string>>(new Set());
  const [activeAd, setActiveAd] = useState<VideoAd | null>(null);
  const [adElapsed, setAdElapsed] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const adTimerRef = useRef<number | null>(null);
  const playerRef = useRef<any>(null);

  // Pre-roll trigger
  useEffect(() => {
    if (!sortedAds.length || activeAd) return;
    const preroll = sortedAds.find((a) => a.start_at_seconds === 0 && !shownAdIds.has(a.id));
    if (preroll) triggerAd(preroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAds.length]);

  // Tick during ad
  useEffect(() => {
    if (!activeAd) return;
    setAdElapsed(0);
    adTimerRef.current = window.setInterval(() => {
      setAdElapsed((e) => {
        const next = e + 1;
        if (next >= activeAd.duration_seconds) {
          closeAd();
        }
        return next;
      });
    }, 1000) as unknown as number;
    return () => {
      if (adTimerRef.current) window.clearInterval(adTimerRef.current);
      adTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAd?.id]);

  const triggerAd = (ad: VideoAd) => {
    setShownAdIds((s) => new Set(s).add(ad.id));
    setPlaying(false);
    setActiveAd(ad);
  };

  const closeAd = () => {
    if (adTimerRef.current) window.clearInterval(adTimerRef.current);
    adTimerRef.current = null;
    setActiveAd(null);
    setAdElapsed(0);
    setPlaying(true);
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (activeAd) return;
    const t = Math.floor(state.playedSeconds);
    const due = sortedAds.find(
      (a) => a.start_at_seconds > 0 && t >= a.start_at_seconds && !shownAdIds.has(a.id),
    );
    if (due) triggerAd(due);
  };

  const canSkip = activeAd && adElapsed >= activeAd.skip_after_seconds;
  const skipIn = activeAd ? Math.max(0, activeAd.skip_after_seconds - adElapsed) : 0;

  // Renderers
  const renderMain = () => {
    if (isEmbedHtml(src)) {
      const html = `<!doctype html><html><head><meta charset="utf-8"/><style>
        html,body{margin:0;padding:0;background:#000;height:100%;width:100%;overflow:hidden}
        iframe,video,embed{position:absolute;inset:0;width:100%!important;height:100%!important;border:0}
      </style></head><body>${src}</body></html>`;
      return (
        <iframe
          title="Embedded player"
          srcDoc={html}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        />
      );
    }
    if (isDirectMedia(src) || isNativeStreamHost(src)) {
      return (
        <ReactPlayer
          ref={playerRef}
          src={src}
          playing={playing}
          controls
          width="100%"
          height="100%"
          light={poster || false}
          onProgress={handleProgress}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          progressInterval={1000}
          config={{ youtube: { rel: 0 } }}
        />
      );
    }
    return (
      <iframe
        title="Stream player"
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
        allowFullScreen
        referrerPolicy="no-referrer"
      />
    );
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-glass-border">
      {renderMain()}

      {activeAd && (
        <div className="absolute inset-0 z-20 bg-black flex flex-col">
          {/* Ad content */}
          <div className="relative flex-1 min-h-0">
            {activeAd.ad_type === "video" && activeAd.video_url ? (
              <ReactPlayer
                src={activeAd.video_url}
                playing
                controls={false}
                muted={false}
                width="100%"
                height="100%"
                onEnded={closeAd}
              />
            ) : activeAd.ad_type === "embed" && activeAd.embed_code ? (
              <iframe
                title={activeAd.title}
                srcDoc={`<!doctype html><html><head><style>html,body{margin:0;background:#000;height:100%;overflow:hidden}iframe,video{position:absolute;inset:0;width:100%!important;height:100%!important;border:0}</style></head><body>${activeAd.embed_code}</body></html>`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <a
                href={activeAd.click_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center"
              >
                {activeAd.image_url ? (
                  <img src={activeAd.image_url} alt={activeAd.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center px-6">
                    <p className="font-display text-2xl text-foreground mb-2">{activeAd.title}</p>
                    {activeAd.click_url && (
                      <span className="inline-flex items-center gap-1 text-primary text-sm">
                        Learn more <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                )}
              </a>
            )}
          </div>

          {/* Ad overlay controls */}
          <div className="absolute top-3 left-3 chip bg-background/70 backdrop-blur-md text-foreground text-[10px]">
            AD · {Math.max(0, activeAd.duration_seconds - adElapsed)}s
          </div>

          <div className="absolute bottom-4 right-4">
            {canSkip ? (
              <button
                onClick={closeAd}
                className="px-4 py-2 rounded-full btn-glow flex items-center gap-1.5 text-xs font-display tracking-widest"
              >
                <SkipForward className="w-4 h-4" /> SKIP AD
              </button>
            ) : (
              <div className="px-4 py-2 rounded-full bg-background/70 backdrop-blur-md text-muted-foreground text-xs font-display tracking-widest flex items-center gap-1.5">
                <X className="w-4 h-4" /> SKIP IN {skipIn}s
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
