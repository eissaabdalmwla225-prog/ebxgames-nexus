import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export const useNavItems = () =>
  useQuery({
    queryKey: ["nav-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as NavItem[];
    },
    staleTime: 60_000,
  });
