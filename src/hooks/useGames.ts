import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface GamePackage {
  id: string;
  amount: number;
  currency: string;
  price: number;
  sort_order: number;
}

export interface Game {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
  game_packages: GamePackage[];
}

export const useGames = () => {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*, game_packages(*)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data as unknown as Game[]).map((g) => ({
        ...g,
        game_packages: (g.game_packages || []).sort(
          (a: GamePackage, b: GamePackage) => a.sort_order - b.sort_order
        ),
      }));
    },
  });
};

export const useAllGames = () => {
  return useQuery({
    queryKey: ["games-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*, game_packages(*)")
        .order("sort_order");
      if (error) throw error;
      return (data as unknown as Game[]).map((g) => ({
        ...g,
        game_packages: (g.game_packages || []).sort(
          (a: GamePackage, b: GamePackage) => a.sort_order - b.sort_order
        ),
      }));
    },
  });
};
