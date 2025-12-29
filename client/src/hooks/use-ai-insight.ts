import { useMutation } from "@tanstack/react-query";

export function useAIInsight() {
  return useMutation({
    mutationFn: async (payload: { sessions: any[]; meds: any[]; fingerTaps: any[]; customPrompt?: string }) => {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate AI insight");
      return res.json();
    },
  });
}
