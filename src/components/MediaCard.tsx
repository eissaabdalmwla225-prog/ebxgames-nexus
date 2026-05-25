import { motion } from "framer-motion";
import { Play, Lock } from "lucide-react";
import type { Media } from "@/hooks/useMedia";

interface MediaCardProps {
  item: Media;
  index?: number;
  onClick: () => void;
}

const MediaCard = ({ item, index = 0, onClick }: MediaCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative aspect-[2/3] rounded-xl overflow-hidden glass-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/60 text-left"
    >
      {item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/30 to-neon-blue/30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="absolute top-2 left-2 flex gap-1">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-background/70 backdrop-blur-sm text-foreground border border-glass-border">
          {item.type}
        </span>
        {!item.is_free && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/80 backdrop-blur-sm text-primary-foreground flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            ${Number(item.price).toFixed(2)}
          </span>
        )}
        {item.is_free && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white">
            Free
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display text-sm font-bold text-foreground truncate">{item.title}</p>
        <p className="text-[11px] text-muted-foreground">
          {item.year ? `${item.year} · ` : ""}{item.category}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl">
          <Play className="w-7 h-7 text-primary-foreground fill-current ml-0.5" />
        </div>
      </div>
    </motion.button>
  );
};

export default MediaCard;
