import { motion } from "framer-motion";
import { Play, Lock, Film, Tv } from "lucide-react";
import type { Media } from "@/hooks/useMedia";

interface MediaCardProps {
  item: Media;
  index?: number;
  onClick: () => void;
}

const MediaCard = ({ item, index = 0, onClick }: MediaCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      onClick={onClick}
      className="group card-tilt relative aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary text-left shadow-[var(--shadow-card)]"
    >
      {item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-card to-background">
          {item.type === "movie" ? <Film className="w-10 h-10 text-primary/50" /> : <Tv className="w-10 h-10 text-primary/50" />}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="absolute top-2 left-2 right-2 flex justify-between gap-1">
        <span className="chip glass-card !border-glass-border text-foreground">
          {item.type === "movie" ? "FILM" : "SERIES"}
        </span>
        {item.is_free ? (
          <span className="chip bg-primary text-primary-foreground">FREE</span>
        ) : (
          <span className="chip bg-foreground/90 text-background">
            <Lock className="w-2.5 h-2.5" /> ${Number(item.price).toFixed(0)}
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display text-base text-foreground truncate tracking-wide">{item.title}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mt-0.5">
          {item.year ? `${item.year} · ` : ""}{item.category}
        </p>
      </div>

      <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-[2px]">
        <div className="w-14 h-14 rounded-full btn-glow grid place-items-center">
          <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
        </div>
      </div>
    </motion.button>
  );
};

export default MediaCard;
