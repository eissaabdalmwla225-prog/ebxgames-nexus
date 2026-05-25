import { useNavigate } from "react-router-dom";
import MatchCard from "@/components/MatchCard";
import BottomNav from "@/components/BottomNav";
import { useMatches, type Match } from "@/hooks/useMatches";

const Live = () => {
  const navigate = useNavigate();
  const { data: matches = [], isLoading } = useMatches();

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = new Date(m.kickoff_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    (acc[day] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-black text-foreground">Live Football</h1>
          <p className="text-sm text-muted-foreground mt-1">All major leagues, AI-powered previews, one tap to watch.</p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading fixtures…</div>
        ) : matches.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 glass-card rounded-xl">
            No fixtures loaded yet. An admin needs to sync fixtures from the dashboard.
          </div>
        ) : (
          Object.entries(grouped).map(([day, list]) => (
            <section key={day} className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">{day}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.map((m) => <MatchCard key={m.id} match={m} onWatch={() => navigate(`/match/${m.id}`)} />)}
              </div>
            </section>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Live;
