import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Film, Tv, Sparkles } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import MediaCard from "@/components/MediaCard";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import FloatingAd from "@/components/FloatingAd";
import SiteFooter from "@/components/SiteFooter";
import { useMedia } from "@/hooks/useMedia";


const Row = ({
  title, icon: Icon, onSeeAll, children,
}: { title: string; icon: any; onSeeAll?: () => void; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-primary" />
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl text-foreground tracking-wide">{title}</h2>
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="flex items-center gap-1 text-xs font-display tracking-widest text-primary hover:text-primary-glow">
          ALL <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    {children}
  </section>
);

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: allMedia = [], isLoading } = useMedia();

  const filtered = useMemo(
    () => allMedia.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())),
    [allMedia, search],
  );

  const movies = filtered.filter((m) => m.type === "movie").slice(0, 12);
  const series = filtered.filter((m) => m.type === "series").slice(0, 12);

  return (
    <div className="min-h-screen bg-background pb-28">
      <HeroSection />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 space-y-10"
      >
        <SearchBar value={search} onChange={setSearch} />
        <AdBanner placement="banner" />

        {isLoading ? (
          <div className="text-center text-muted-foreground py-16 font-display tracking-widest">LOADING LIBRARY…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 glass-card rounded-2xl">
            Nothing here yet. Admins can add titles from the dashboard.
          </div>
        ) : (
          <>
            {movies.length > 0 && (
              <Row title="MOVIES" icon={Film} onSeeAll={() => navigate("/movies")}>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory">
                  {movies.map((m, i) => (
                    <div key={m.id} className="snap-start shrink-0 w-[55vw] sm:w-56 md:w-64">
                      <MediaCard item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />
                    </div>
                  ))}

                </div>
              </Row>
            )}

            <AdBanner placement="between-rows" />

            {series.length > 0 && (
              <Row title="SERIES" icon={Tv} onSeeAll={() => navigate("/series")}>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory">
                  {series.map((m, i) => (
                    <div key={m.id} className="snap-start shrink-0 w-[55vw] sm:w-56 md:w-64">
                      <MediaCard item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />
                    </div>
                  ))}

                </div>
              </Row>
            )}

            <Row title="TRENDING" icon={Sparkles}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {filtered.slice(0, 12).map((m, i) => (
                  <MediaCard key={m.id} item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />
                ))}
              </div>

            </Row>
          </>
        )}

        <AdBanner placement="footer" />
      </motion.div>

      <SiteFooter />

      <BottomNav />
      <FloatingAd />
    </div>
  );
};

export default Index;
