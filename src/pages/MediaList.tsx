import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MediaCard from "@/components/MediaCard";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import { useMedia } from "@/hooks/useMedia";

const MediaListPage = ({ type, title }: { type: "movie" | "series"; title: string }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useMedia(type);
  const filtered = useMemo(() => data.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())), [data, search]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        <h1 className="font-display text-3xl font-black text-foreground">{title}</h1>
        <SearchBar value={search} onChange={setSearch} />
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 glass-card rounded-xl">Nothing here yet.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filtered.map((m, i) => <MediaCard key={m.id} item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />)}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export const MoviesPage = () => <MediaListPage type="movie" title="Movies" />;
export const SeriesPage = () => <MediaListPage type="series" title="Series" />;
