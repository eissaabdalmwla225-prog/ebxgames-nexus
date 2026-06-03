import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  media_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export const useReviews = (mediaId: string | undefined) => {
  return useQuery({
    queryKey: ["reviews", mediaId],
    enabled: !!mediaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("media_id", mediaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data || []) as Review[];

      // Fetch profile info for each unique user
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);
        const map = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        for (const r of rows) {
          const p = map.get(r.user_id);
          r.display_name = p?.display_name ?? null;
          r.avatar_url = p?.avatar_url ?? null;
        }
      }
      return rows;
    },
  });
};

export const useReviewSummary = (mediaId: string | undefined) => {
  const { data: reviews = [] } = useReviews(mediaId);
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(avg * 10) / 10 };
};
