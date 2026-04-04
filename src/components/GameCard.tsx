import { motion } from "framer-motion";
import type { Game } from "@/data/games";

interface GameCardProps {
  game: Game;
  index: number;
  onClick: () => void;
}

const GameCard = ({ game, index, onClick }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, rotateY: 3, rotateX: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-2xl overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Glow border on hover */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />

      <div className="relative glass-card overflow-hidden rounded-2xl">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={game.image}
            alt={game.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium bg-primary/20 text-primary mb-2">
            {game.category}
          </span>
          <h3 className="font-display text-base font-bold text-foreground leading-tight">
            {game.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            From ${game.packages[0].price.toFixed(2)}
          </p>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
