import { motion } from "framer-motion";

const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-48 rounded bg-muted animate-pulse" />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;
