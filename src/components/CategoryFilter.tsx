import { motion } from "framer-motion";

const categories = ["All", "Shooter", "Sports", "Sandbox"] as const;

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-2 justify-center flex-wrap"
    >
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            selected === cat
              ? "btn-glow text-primary-foreground"
              : "glass-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </motion.div>
  );
};

export default CategoryFilter;
