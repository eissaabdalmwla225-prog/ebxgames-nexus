import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useReviews } from "@/hooks/useReviews";

interface Props {
  mediaId: string;
}


const ReviewsSection = ({ mediaId }: Props) => {
  const { data: reviews = [], isLoading } = useReviews(mediaId);

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h3 className="font-display text-xl text-foreground tracking-wider">REVIEWS</h3>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(avg) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
            <span className="text-sm font-mono text-foreground tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({count})</span>
          </div>
        )}
      </div>


      {/* List */}
      {isLoading ? (
        <p className="text-center text-muted-foreground text-sm py-4">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-4">Be the first to review.</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.2) }}
              className="glass-card rounded-xl p-3 flex gap-3 border border-glass-border"
            >
              {r.avatar_url ? (
                <img src={r.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center shrink-0">
                  <span className="text-sm font-display text-primary">
                    {(r.display_name || "?")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm text-foreground tracking-wide truncate">
                    {r.display_name || "Viewer"}
                  </p>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
