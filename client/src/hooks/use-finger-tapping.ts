import { useQuery } from "@tanstack/react-query";

export interface FingerTappingSession {
  id: number;
  userId: number;
  hand: "left" | "right";
  avgInterval: number;
  stdDev: number;
  tapsPerSecond: number;
  regularityScore: number;
  asymmetryScore: number;
  rhythmStability: number;
  totalTaps: number;
  timestamp: string;
}

export function useFingerTapping() {
  return useQuery<FingerTappingSession[]>({
    queryKey: ["/api/finger-tapping"],
    queryFn: async () => {
      const res = await fetch("/api/finger-tapping");
      if (!res.ok) throw new Error("Failed to load finger tapping sessions");
      return res.json();
    },
  });
}
