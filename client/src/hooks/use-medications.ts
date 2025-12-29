import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMedications() {
  return useQuery({
    queryKey: [api.medications.list.path],
    queryFn: async () => {
      const res = await fetch(api.medications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch medications");
      return api.medications.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { medicationName: string; dosage?: string; timeTaken?: string }) => {
      const validated = api.medications.create.input.parse(data);
      const res = await fetch(api.medications.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.medications.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to log medication");
      }
      return api.medications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      toast({
        title: "Medication Logged",
        description: "Your medication intake has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
