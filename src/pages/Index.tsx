import { useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import GameCard from "@/components/GameCard";
import GameCardSkeleton from "@/components/GameCardSkeleton";
import GameDetail from "@/components/GameDetail";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { useGames, type Game } from "@/hooks/useGames";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: games = [], isLoading } = useGames();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(games.map((g) => g.category)));
    return ["All", ...cats];
  }, [games]);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || g.category === category;
      return matchSearch && matchCat;
    });
  }, [games, search, category]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "search") {
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      searchRef.current?.querySelector("input")?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroSection />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto px-4 pb-20 space-y-6"
      >
        <div ref={searchRef}>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <AdBanner placement="banner" />

        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mt-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <GameCardSkeleton key={i} index={i} />
              ))
            : filtered.map((game, i) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={i}
                  onClick={() => setSelectedGame(game)}
                />
                ))}
        </div>

        <AdBanner placement="between-games" />

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No games found.</p>
        )}

        <AdBanner placement="footer" />
      </motion.div>

      {!selectedGame && (
        <BottomNav active={activeTab} onNavigate={handleNavigate} />
      )}

      <AnimatePresence>
        {selectedGame && (
          <GameDetail game={selectedGame} onBack={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
