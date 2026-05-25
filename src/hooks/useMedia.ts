import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Media {
  id: string;
  type: "movie" | "series";
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  category: string;
  year: number | null;
  video_url: string | null;
  price: number;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Episode {
  id: string;
  media_id: string;
  season: number;
  episode_number: number;
  title: string;
  description: string | null;
  video_url: string;
  duration: number | null;
  thumbnail_url: string | null;
}

export const useMedia = (type?: "movie" | "series") => {
  return useQuery({
    queryKey: ["media", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("media").select("*").eq("is_active", true).order("sort_order");
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Media[];
    },
  });
};

export const useAllMedia = () => {
  return useQuery({
    queryKey: ["media-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as Media[];
    },
  });
};

export const useMediaItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ["media", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Media;
    },
  });
};

export const useEpisodes = (mediaId: string | undefined) => {
  return useQuery({
    queryKey: ["episodes", mediaId],
    enabled: !!mediaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("media_id", mediaId!)
        .order("season")
        .order("episode_number");
      if (error) throw error;
      return (data || []) as Episode[];
    },
  });
};
