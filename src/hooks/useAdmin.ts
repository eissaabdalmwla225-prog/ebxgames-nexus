import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-check", user?.email],
    queryFn: async () => {
      if (!user?.email) return false;
      const { data, error } = await supabase
        .from("admin_emails")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
      return !error && !!data;
    },
    enabled: !!user?.email,
  });

  return { isAdmin, isLoading };
};
