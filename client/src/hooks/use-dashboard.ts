import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { supabase } from "@/lib/supabase";

export function useDashboard() {
  return useQuery({
    queryKey: [api.dashboard.get.path],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch(api.dashboard.get.path, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.get.responses[200].parse(await res.json());
    },
  });
}
