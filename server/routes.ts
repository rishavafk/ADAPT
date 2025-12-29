import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// --- ANALYSIS LOGIC ---

function analyzeTremor(points: Array<{ x: number; y: number; timestamp: number }>) {
  if (points.length < 2) {
    return {
      tremorAmplitude: 0,
      jitter: 0,
      estimatedFrequency: 0,
      severityScore: 0,
      tremorState: "Stable",
    };
  }

  // 1. Calculate path length and total time
  let totalDistance = 0;
  let totalTime = points[points.length - 1].timestamp - points[0].timestamp;
  const segmentLengths = [];

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDistance += dist;
    segmentLengths.push(dist);
  }

  // 2. Estimate Tremor Amplitude (Deviation from smooth line)
  // Simplified: Variance of segment lengths represents jerkiness/tremor in drawing speed/distance
  const avgSegment = totalDistance / segmentLengths.length;
  const variance = segmentLengths.reduce((acc, len) => acc + Math.pow(len - avgSegment, 2), 0) / segmentLengths.length;
  const tremorAmplitude = Math.sqrt(variance); // Using std dev of stroke segments as proxy for amplitude irregularity

  // 3. Jitter (High frequency changes in direction/acceleration)
  // We can look at the change in "velocity" between segments
  // This is a rough heuristic
  const jitter = tremorAmplitude * 0.5; // Simplified for demo

  // 4. Frequency
  // Count peaks/valleys in acceleration (simplified as direction changes could be noise)
  // Demo heuristic: proportional to number of points over time
  const estimatedFrequency = Math.min(12, (points.length / (totalTime / 1000)) * 0.5); // Cap at 12Hz

  // 5. Severity Score (0-10)
  // Normalize amplitude: assume amplitude > 50 is severe
  const normalizedAmp = Math.min(10, (tremorAmplitude / 20) * 10);
  const severityScore = Math.round(normalizedAmp * 10) / 10;

  // 6. State
  let tremorState = "Stable";
  if (severityScore > 7) tremorState = "Severe";
  else if (severityScore > 3) tremorState = "Moderate";

  return {
    tremorAmplitude,
    jitter,
    estimatedFrequency,
    severityScore,
    tremorState,
  };
}

function analyzeMedicationState(lastDoseTime: Date | undefined, currentTremorScore: number) {
  if (!lastDoseTime) return { state: "OFF", timeSince: 0 };

  const now = new Date();
  const diffMinutes = (now.getTime() - lastDoseTime.getTime()) / (1000 * 60);

  // Simple pharmacological curve simulation for demo
  // 0-30 mins: Onset (Improving)
  // 30-180 mins: Peak Effect (ON)
  // 180-240 mins: Wearing Off
  // >240 mins: OFF

  let state = "OFF";
  if (diffMinutes < 30) state = "ON"; // Taking effect
  else if (diffMinutes < 180) state = "ON";
  else if (diffMinutes < 240) state = "WEARING_OFF";
  else state = "OFF";

  return { state, timeSince: Math.floor(diffMinutes) };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- API ROUTES ---

  app.post(api.sessions.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const user = req.user as any;
      const userId = user.claims.sub;

      const analysis = analyzeTremor(input.points);

      const session = await storage.createSession({
        userId,
        points: input.points,
        ...analysis,
        tremorState: analysis.tremorState
      });

      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.sessions.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;
    const sessions = await storage.getSessions(userId);
    res.json(sessions);
  });

  app.post(api.medications.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.medications.create.input.parse(req.body);
      const user = req.user as any;
      const userId = user.claims.sub;

      const log = await storage.createMedicationLog({
        userId,
        medicationName: input.medicationName,
        dosage: input.dosage,
        timeTaken: input.timeTaken ? new Date(input.timeTaken) : new Date(),
      });

      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.medications.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;
    const logs = await storage.getMedicationLogs(userId);
    res.json(logs);
  });

  app.get(api.dashboard.get.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;

    const sessions = await storage.getSessions(userId);
    const lastMedication = await storage.getLastMedication(userId);

    // Current State
    const latestSession = sessions[0];
    const currentTremorScore = latestSession?.severityScore || 0;
    const { state: currentMedicationState, timeSince } = analyzeMedicationState(
      lastMedication?.timeTaken,
      currentTremorScore
    );

    // Stats
    const totalScore = sessions.reduce((acc, s) => acc + (s.severityScore || 0), 0);
    const averageTremorScore = sessions.length > 0 ? totalScore / sessions.length : 0;
    
    // Trend
    let tremorTrend = "Stable";
    if (sessions.length >= 2) {
      const recent = sessions[0].severityScore || 0;
      const previous = sessions[1].severityScore || 0;
      if (recent < previous - 0.5) tremorTrend = "Improving";
      else if (recent > previous + 0.5) tremorTrend = "Worsening";
    }

    // Timeline
    const trendTimeline = sessions.map(s => ({
      timestamp: s.timestamp.getTime(),
      tremorScore: s.severityScore || 0,
      medicationState: "Unknown" // Could be correlated historically if needed
    })).reverse(); // Oldest first for charts

    const response = {
      currentMedicationState,
      timeSinceLastDoseMinutes: timeSince,
      tremorTrend,
      averageTremorScore: Number(averageTremorScore.toFixed(1)),
      bestPostMedicationScore: 2.5, // Mock data or calculate from history
      medicationEffectivenessScore: 85, // Mock data
      insight: currentMedicationState === "ON" 
        ? "Medication is currently effective. Tremor levels are stable."
        : "Medication effect may be wearing off. Consider tracking your next dose.",
      trendTimeline
    };

    res.json(response);
  });

  // Seed demo data (optional, but good for first run if we had a known user)
  // Since we rely on auth, we can't easily seed for "current user" here without them logging in first.

  return httpServer;
}
