import { motion } from "framer-motion";
import { Play, Lock, Film, Tv, Star } from "lucide-react";
import type { Media } from "@/hooks/useMedia";
import { useReviewSummary } from "@/hooks/useReviews";

interface MediaCardProps {
  item: Media;
  index?: number;
  onClick: () => void;
}

const MediaCard = ({ item, index = 0, onClick }: MediaCardProps) => {
  const { count, average } = useReviewSummary(item.id);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      onClick={onClick}
      className="group block w-full text-left focus:outline-none"
    >
      {/* Poster — bigger, no overlay text */}
      <div className="card-tilt relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-card border border-glass-border shadow-[var(--shadow-card)] focus:ring-2 focus:ring-primary">
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-card to-background">
            {item.type === "movie" ? <Film className="w-12 h-12 text-primary/50" /> : <Tv className="w-12 h-12 text-primary/50" />}
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex justify-between gap-1">
          <span className="chip glass-card !border-glass-border text-foreground text-[10px]">
            {item.type === "movie" ? "FILM" : "SERIES"}
          </span>
          {item.is_free ? (
            <span className="chip bg-primary text-primary-foreground text-[10px]">FREE</span>
          ) : (
            <span className="chip bg-foreground/90 text-background text-[10px]">
              <Lock className="w-2.5 h-2.5" /> ${Number(item.price).toFixed(0)}
            </span>
          )}
        </div>

        {count > 0 && (
          <div className="absolute bottom-2 left-2 chip bg-background/80 backdrop-blur-md text-foreground text-[10px]">
            <Star className="w-2.5 h-2.5 fill-primary text-primary" />
            {average.toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-[2px]">
          <div className="w-16 h-16 rounded-full btn-glow grid place-items-center">
            <Play className="w-7 h-7 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Title BELOW the image */}
      <div className="pt-3 px-0.5 space-y-0.5">
        <p className="font-display text-base sm:text-lg text-foreground leading-tight tracking-wide line-clamp-2">
          {item.title}
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
          {item.year ? `${item.year} · ` : ""}{item.category}
        </p>
      </div>
    </motion.button>
  );
};

export default MediaCard;
