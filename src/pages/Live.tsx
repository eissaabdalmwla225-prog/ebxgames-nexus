import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import BottomNav from "@/components/BottomNav";
import { useMatches, type Match } from "@/hooks/useMatches";

const Live = () => {
  const navigate = useNavigate();
  const { data: matches = [], isLoading } = useMatches();

  const live = matches.filter((m) => m.is_live);
  const today = matches.filter((m) => {
    const d = new Date(m.kickoff_at);
    const now = new Date();
    return !m.is_live && d.toDateString() === now.toDateString();
  });
  const upcoming = matches.filter((m) => {
    const d = new Date(m.kickoff_at).getTime();
    const now = Date.now();
    return !m.is_live && new Date(d).toDateString() !== new Date(now).toDateString() && d > now;
  });

  const grouped = upcoming.reduce<Record<string, Match[]>>((acc, m) => {
    const day = new Date(m.kickoff_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    (acc[day] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="relative px-4 pt-10 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full glass-card border-primary/30">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            <span className="text-[10px] font-display tracking-[0.3em] text-foreground">LIVE FOOTBALL</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-foreground tracking-wider">
            MATCH<span className="text-primary">DAY</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Every major league. AI-powered previews. One tap to watch live.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-16 font-display tracking-widest">LOADING FIXTURES…</div>
        ) : matches.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 glass-card rounded-2xl">
            No fixtures loaded yet. An admin needs to sync from the dashboard.
          </div>
        ) : (
          <>
            {live.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-live" />
                  <Radio className="w-5 h-5 text-live" />
                  <h2 className="font-display text-2xl text-foreground tracking-wide">LIVE NOW</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {live.map((m) => <MatchCard key={m.id} match={m} onWatch={() => navigate(`/match/${m.id}`)} />)}
                </div>
              </section>
            )}

            {today.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-primary" />
                  <h2 className="font-display text-2xl text-foreground tracking-wide">TODAY</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {today.map((m) => <MatchCard key={m.id} match={m} onWatch={() => navigate(`/match/${m.id}`)} />)}
                </div>
              </section>
            )}

            {Object.entries(grouped).map(([day, list]) => (
              <section key={day} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-glass-border" />
                  <h2 className="font-display text-2xl text-foreground tracking-wide uppercase">{day}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {list.map((m) => <MatchCard key={m.id} match={m} onWatch={() => navigate(`/match/${m.id}`)} />)}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Live;
