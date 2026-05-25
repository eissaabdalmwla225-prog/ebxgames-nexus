import { motion } from "framer-motion";
import { Play, Radio, Clock } from "lucide-react";
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
      const { data, error } = await supabase.functions.invoke("ai-match-insights", {
        body: { matchId: match.id },
      });
      if (error) throw error;
      if (data?.insight) setInsight(data.insight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-2xl border border-glass-border space-y-3"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-medium uppercase tracking-wider">
          {match.league_name}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/20 text-destructive font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            LIVE
          </span>
        ) : isFinished ? (
          <span className="text-muted-foreground">FT</span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            {kickoff.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {match.home_logo && <img src={match.home_logo} alt="" className="w-8 h-8 object-contain shrink-0" />}
          <span className="font-display text-sm font-bold text-foreground truncate">{match.home_team}</span>
        </div>
        <div className="font-display text-xl font-black text-foreground tabular-nums">
          {isLive || isFinished
            ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
            : "vs"}
        </div>
        <div className="flex items-center gap-2 min-w-0 justify-end">
          <span className="font-display text-sm font-bold text-foreground truncate text-right">{match.away_team}</span>
          {match.away_logo && <img src={match.away_logo} alt="" className="w-8 h-8 object-contain shrink-0" />}
        </div>
      </div>

      {insight && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-2">
          {insight}
        </p>
      )}

      <div className="flex gap-2">
        {!insight && !isFinished && (
          <button
            onClick={fetchInsight}
            disabled={loadingInsight}
            className="flex-1 text-xs py-2 rounded-lg glass-card hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
          >
            {loadingInsight ? "Thinking…" : "✨ AI preview"}
          </button>
        )}
        {match.stream_url && !isFinished && (
          <button
            onClick={() => onWatch?.(match)}
            className="flex-1 btn-glow text-primary-foreground py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
          >
            {isLive ? <><Radio className="w-3.5 h-3.5" /> Watch Live</> : <><Play className="w-3.5 h-3.5 fill-current" /> Watch</>}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MatchCard;
