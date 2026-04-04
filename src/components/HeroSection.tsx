import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);

  return (
    <section
      ref={ref}
      className="relative min-h-[50vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-8"
    >
      {/* Parallax background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-purple/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-blue/10 blur-[120px]"
        />
        <motion.div
          style={{ y: y3 }}
          className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-neon-cyan/5 blur-[80px]"
        />
      </div>

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
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
      </motion.div>
    </section>
  );
};

export default HeroSection;
