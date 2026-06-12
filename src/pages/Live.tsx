import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Calendar } from "lucide-react";
import { useStreams } from "@/hooks/useStreams";
import BottomNav from "@/components/BottomNav";

const Live = () => {
  const navigate = useNavigate();
  const { data: streams = [], isLoading } = useStreams();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 glass-panel border-b border-glass-border safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <h1 className="font-display text-lg tracking-widest">LIVE STREAMS</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="grid place-items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !streams.length ? (
          <div className="text-center py-20">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No live streams scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/live/${s.id}`)}
                className="text-left glass-card rounded-2xl overflow-hidden hover:border-primary/40 transition group"
              >
                <div className="relative aspect-video bg-muted">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <Radio className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  {s.is_live && (
                    <span className="absolute top-2 left-2 chip bg-destructive text-destructive-foreground text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                  )}
                  {s.category && (
                    <span className="absolute top-2 right-2 chip bg-background/70 backdrop-blur text-[10px]">{s.category}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-display text-sm text-foreground line-clamp-2">{s.title}</p>
                  {s.starts_at && (
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.starts_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Live;
