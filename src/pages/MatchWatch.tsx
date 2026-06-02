import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { useMatch } from "@/hooks/useMatches";

const MatchWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: match, isLoading } = useMatch(id ? Number(id) : undefined);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!match) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Match not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 glass-card backdrop-blur-2xl border-b border-glass-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <h2 className="font-display text-sm font-bold text-foreground truncate">{match.home_team} vs {match.away_team}</h2>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {match.stream_url ? (
          <VideoPlayer url={match.stream_url} />
        ) : (
          <div className="aspect-video rounded-2xl glass-card flex items-center justify-center text-muted-foreground text-center px-4">
            No stream URL set for this match yet.
          </div>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{match.league_name}</p>
        {match.ai_insight && <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">{match.ai_insight}</p>}
      </div>
      <BottomNav />
    </div>
  );
};

export default MatchWatch;
