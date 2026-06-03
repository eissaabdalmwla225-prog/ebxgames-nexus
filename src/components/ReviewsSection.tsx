import { useEffect, useState } from "react";
import { Star, Send, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReviews } from "@/hooks/useReviews";

interface Props {
  mediaId: string;
}

const ReviewsSection = ({ mediaId }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useReviews(mediaId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const own = reviews.find((r) => r.user_id === user?.id);

  useEffect(() => {
    if (own) {
      setRating(own.rating);
      setComment(own.comment || "");
    }
  }, [own?.id]);

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  const submit = async () => {
    if (!user) {
      toast.error("Sign in to leave a review");
      return;
    }
    if (rating < 1) {
      toast.error("Pick a star rating");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        media_id: mediaId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      };
      const { error } = await supabase
        .from("reviews")
        .upsert(payload, { onConflict: "media_id,user_id" });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["reviews", mediaId] });
      toast.success(own ? "Review updated" : "Thanks for the review!");
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!own || !confirm("Delete your review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", own.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["reviews", mediaId] });
    setRating(0);
    setComment("");
  };

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

      {/* Composer */}
      <div className="glass-card rounded-2xl p-4 space-y-3 border border-glass-border">
        {!user ? (
          <p className="text-sm text-muted-foreground text-center py-2">Sign in to rate and review.</p>
        ) : (
          <>
            <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  className="p-1"
                  aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-7 h-7 transition ${
                      i <= (hover || rating)
                        ? "fill-primary text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-display tracking-widest text-muted-foreground">
                {rating ? `${rating}/5` : "TAP TO RATE"}
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              rows={3}
              placeholder="Share what you thought… (optional)"
              className="w-full px-4 py-3 rounded-xl bg-background/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground font-mono">{comment.length}/1000</span>
              <div className="flex items-center gap-2">
                {own && (
                  <button
                    onClick={remove}
                    className="px-3 py-2 rounded-xl glass-card text-xs font-display tracking-widest text-destructive flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE
                  </button>
                )}
                <button
                  onClick={submit}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl btn-glow text-xs font-display tracking-widest flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {own ? "UPDATE" : "POST"}
                </button>
              </div>
            </div>
          </>
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
