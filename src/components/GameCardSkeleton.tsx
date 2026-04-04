import { motion } from "framer-motion";

const GameCardSkeleton = ({ index }: { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative rounded-2xl overflow-hidden glass-card"
    >
      <div className="aspect-[3/4] bg-muted animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-3 w-14 rounded bg-muted animate-pulse" />
      </div>
    </motion.div>
  );
};

export default GameCardSkeleton;
