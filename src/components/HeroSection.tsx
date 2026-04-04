import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-8">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-purple/10 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-blue/10 blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-neon-cyan/5 blur-[80px] animate-float" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <Gamepad2 className="w-8 h-8 text-neon-purple" />
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Premium Gaming
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4"
        >
          <span className="gradient-text">EBX</span>{" "}
          <span className="text-foreground">Game Store</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-muted-foreground font-light"
        >
          Top Up & Play Instantly
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
