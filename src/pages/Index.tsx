import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import GameCard from "@/components/GameCard";
import GameDetail from "@/components/GameDetail";
import { games, type Game } from "@/data/games";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || g.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 pb-20 space-y-6">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter selected={category} onSelect={setCategory} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mt-8">
          {filtered.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              onClick={() => setSelectedGame(game)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No games found.</p>
        )}
      </div>

      <AnimatePresence>
        {selectedGame && (
          <GameDetail game={selectedGame} onBack={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
