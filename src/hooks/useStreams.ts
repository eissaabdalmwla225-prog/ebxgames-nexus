import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Stream {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_url: string;
  stream_type: string;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_live: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export const useStreams = () =>
  useQuery({
    queryKey: ["streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Stream[];
    },
    staleTime: 30_000,
  });

export const useStream = (id?: string) =>
  useQuery({
    queryKey: ["stream", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("streams").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Stream | null;
    },
  });
