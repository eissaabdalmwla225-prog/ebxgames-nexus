import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Radio } from "lucide-react";
import { useStream } from "@/hooks/useStreams";
import VideoPlayer from "@/components/VideoPlayer";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";

const LiveWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: stream, isLoading } = useStream(id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 glass-panel border-b border-glass-border safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-base tracking-widest truncate">{stream?.title || "Live"}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {isLoading ? (
          <div className="aspect-video grid place-items-center bg-muted rounded-2xl">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !stream ? (
          <div className="text-center py-20">
            <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Stream not found.</p>
          </div>
        ) : (
          <>
            <AdBanner placement="live-watch-top" />
            <VideoPlayer
              url={stream.stream_url}
              poster={stream.thumbnail_url || undefined}
              streamId={stream.id}
            />
            <AdBanner placement="live-watch-below" />
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                {stream.is_live && (
                  <span className="chip bg-destructive text-destructive-foreground text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </span>
                )}
                {stream.category && <span className="chip text-[10px]">{stream.category}</span>}
              </div>
              <h2 className="font-display text-xl text-foreground">{stream.title}</h2>
              {stream.description && <p className="text-sm text-muted-foreground mt-2">{stream.description}</p>}
            </div>
            <AdBanner placement="live-watch-footer" />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default LiveWatch;
