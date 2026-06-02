import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Tv, Film, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-4 pt-12 pb-10 sm:pt-20 sm:pb-16"
    >
      {/* Stadium-floodlight glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div style={{ y: y1 }} className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[120px]" />
        <motion.div style={{ y: y2 }} className="absolute top-1/3 -right-10 w-80 h-80 rounded-full bg-primary-glow/15 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Pitch lines */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
           style={{ backgroundImage: "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px)", backgroundSize: "100% 32px" }} />

      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full glass-card border-primary/30"
        >
          <span className="w-2 h-2 rounded-full bg-primary-glow animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-glow">
            Movies · Series · On Demand
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[3.5rem] leading-[0.9] sm:text-[5.5rem] md:text-[7rem] font-normal text-balance"
        >
          <span className="block text-foreground">EVERY STORY.</span>
          <span className="block gradient-text">EVERY SCREEN.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg font-medium"
        >
          Blockbuster movies and binge-worthy series — all in one cinematic player.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <button onClick={() => navigate("/movies")}
            className="btn-glow flex items-center gap-2 px-5 py-3 rounded-full font-display text-lg tracking-widest">
            <Play className="w-5 h-5 fill-current" /> WATCH NOW
          </button>
          <button onClick={() => navigate("/series")}
            className="glass-card flex items-center gap-2 px-5 py-3 rounded-full font-display text-lg tracking-widest text-foreground hover:border-primary/50 transition">
            <Tv className="w-5 h-5 text-primary" /> BROWSE
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-3 max-w-md"
        >
          {[
            { icon: Sparkles, k: "1000+", v: "Titles" },
            { icon: Film,  k: "HD",  v: "Movies"  },
            { icon: Tv,    k: "4K",  v: "Series"  },
          ].map((s) => (
            <div key={s.v} className="glass-card px-3 py-2.5 flex flex-col">
              <s.icon className="w-4 h-4 text-primary mb-1" />
              <span className="font-display text-2xl text-foreground leading-none">{s.k}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.v}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
