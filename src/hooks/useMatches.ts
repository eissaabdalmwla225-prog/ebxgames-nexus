import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Match {
  id: number;
  league_id: number | null;
  league_name: string | null;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  kickoff_at: string;
  status: string | null;
  home_score: number | null;
  away_score: number | null;
  stream_url: string | null;
  ai_insight: string | null;
  is_live: boolean;
}

export const useMatches = () => {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .gte("kickoff_at", new Date(Date.now() - 6 * 3600 * 1000).toISOString())
        .order("kickoff_at");
      if (error) throw error;
      return (data || []) as Match[];
    },
    refetchInterval: 60_000,
  });
};

export const useMatch = (id: number | undefined) => {
  return useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Match;
    },
  });
};
