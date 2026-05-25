import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import MediaCard from "@/components/MediaCard";
import MatchCard from "@/components/MatchCard";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { useMedia } from "@/hooks/useMedia";
import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: media = [], isLoading } = useMedia();
  const { data: matches = [] } = useMatches();

  const filtered = useMemo(
    () => media.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())),
    [media, search],
  );

  const liveOrSoon = matches.filter((m) => {
    const diff = new Date(m.kickoff_at).getTime() - Date.now();
    return m.is_live || (diff > 0 && diff < 24 * 3600 * 1000);
  }).slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-24">
      <HeroSection />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 space-y-8"
      >
        <SearchBar value={search} onChange={setSearch} />
        <AdBanner placement="banner" />

        {liveOrSoon.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">⚽ Live & Upcoming</h2>
              <button onClick={() => navigate("/live")} className="text-xs text-primary hover:underline">See all →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {liveOrSoon.map((m) => <MatchCard key={m.id} match={m} onWatch={() => navigate(`/match/${m.id}`)} />)}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">🎬 Trending</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 glass-card rounded-xl">
              Nothing here yet. Admins can add titles from the dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filtered.map((m, i) => (
                <MediaCard key={m.id} item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />
              ))}
            </div>
          )}
        </section>

        <AdBanner placement="footer" />
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Index;
