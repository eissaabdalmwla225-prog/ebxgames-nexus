import { motion } from "framer-motion";
import { Play, Radio, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/hooks/useMatches";

interface Props {
  match: Match;
  onWatch?: (m: Match) => void;
}

const MatchCard = ({ match, onWatch }: Props) => {
  const [insight, setInsight] = useState<string | null>(match.ai_insight);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const kickoff = new Date(match.kickoff_at);
  const isLive = match.is_live || ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(match.status || "");
  const isFinished = ["FT", "AET", "PEN"].includes(match.status || "");

  const fetchInsight = async () => {
    if (insight || loadingInsight) return;
    setLoadingInsight(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-match-insights", { body: { matchId: match.id } });
      if (error) throw error;
      if (data?.insight) setInsight(data.insight);
    } catch (e) { console.error(e); }
    finally { setLoadingInsight(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative glass-card p-4 rounded-2xl overflow-hidden"
    >
      {isLive && (
        <div className="absolute inset-0 pointer-events-none opacity-30"
             style={{ background: "radial-gradient(ellipse at top right, hsl(var(--live) / 0.35), transparent 60%)" }} />
      )}
      <div className="relative space-y-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-display tracking-[0.15em] text-muted-foreground uppercase truncate max-w-[60%]">
            {match.league_name}
          </span>
          {isLive ? (
            <span className="chip bg-live text-live-foreground live-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-live-foreground" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="chip bg-muted text-muted-foreground">FULL TIME</span>
          ) : (
            <span className="chip glass-card text-foreground">
              <Clock className="w-3 h-3" />
              {kickoff.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {match.home_logo && <img src={match.home_logo} alt="" className="w-9 h-9 object-contain shrink-0 drop-shadow" />}
            <span className="font-display text-base text-foreground truncate tracking-wide">{match.home_team}</span>
          </div>
          <div className="scoreline text-3xl text-foreground px-2">
            {isLive || isFinished
              ? <span className="text-primary">{match.home_score ?? 0}<span className="text-muted-foreground mx-1.5">:</span>{match.away_score ?? 0}</span>
              : <span className="text-muted-foreground text-xl">VS</span>}
          </div>
          <div className="flex items-center gap-2 min-w-0 justify-end">
            <span className="font-display text-base text-foreground truncate text-right tracking-wide">{match.away_team}</span>
            {match.away_logo && <img src={match.away_logo} alt="" className="w-9 h-9 object-contain shrink-0 drop-shadow" />}
          </div>
        </div>

        {insight && (
          <p className="text-xs text-foreground/80 italic leading-relaxed border-l-2 border-primary pl-2.5">
            {insight}
          </p>
        )}

        <div className="flex gap-2">
          {!insight && !isFinished && (
            <button
              onClick={fetchInsight}
              disabled={loadingInsight}
              className="flex-1 text-[11px] py-2.5 rounded-full glass-card hover:border-primary/50 transition text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 font-display tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loadingInsight ? "ANALYZING…" : "AI PREVIEW"}
            </button>
          )}
          {match.stream_url && !isFinished && (
            <button
              onClick={() => onWatch?.(match)}
              className="flex-1 btn-glow py-2.5 rounded-full text-[11px] font-display tracking-widest flex items-center justify-center gap-1.5"
            >
              {isLive ? <><Radio className="w-3.5 h-3.5" /> WATCH LIVE</> : <><Play className="w-3.5 h-3.5 fill-current" /> WATCH</>}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
