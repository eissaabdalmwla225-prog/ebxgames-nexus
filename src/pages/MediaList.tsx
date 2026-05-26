import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Tv } from "lucide-react";
import MediaCard from "@/components/MediaCard";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import { useMedia } from "@/hooks/useMedia";

const MediaListPage = ({ type, title, subtitle }: { type: "movie" | "series"; title: string; subtitle: string }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { data = [], isLoading } = useMedia(type);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((m) => m.category && set.add(m.category));
    return ["All", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(
    () => data.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || m.category === category),
    ),
    [data, search, category],
  );

  const Icon = type === "movie" ? Film : Tv;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="relative px-4 pt-10 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 left-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full glass-card border-primary/30">
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-display tracking-[0.3em] text-foreground">{type === "movie" ? "ON DEMAND" : "BINGE READY"}</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-foreground tracking-wider">
            {title.split(" ").map((w, i) => (
              <span key={i} className={i === title.split(" ").length - 1 ? "text-primary" : ""}>{w} </span>
            ))}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">{subtitle}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 space-y-5">
        <SearchBar value={search} onChange={setSearch} />

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-display tracking-widest transition ${
                  category === c
                    ? "btn-glow"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground py-16 font-display tracking-widest">LOADING…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 glass-card rounded-2xl">
            Nothing here yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((m, i) => <MediaCard key={m.id} item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />)}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export const MoviesPage = () => <MediaListPage type="movie" title="MOVIES NIGHT" subtitle="Big screen energy, anywhere you are." />;
export const SeriesPage = () => <MediaListPage type="series" title="SERIES VAULT" subtitle="Pick your next obsession and binge it through." />;
