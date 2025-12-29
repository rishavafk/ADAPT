import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated } from "./supabaseAuth";
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
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    res.json({
      id: req.user?.claims?.sub,
      email: req.user?.claims?.email ?? null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      createdAt: null,
      updatedAt: null,
    });
  });

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
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const message = err instanceof Error ? err.message : "Failed to create session";
      return res.status(500).json({ message });
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
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const message = err instanceof Error ? err.message : "Failed to create medication log";
      return res.status(500).json({ message });
    }
  });

  app.get(api.medications.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;
    const logs = await storage.getMedicationLogs(userId);
    res.json(logs);
  });

  app.delete("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      const userId = user.claims.sub;

      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await storage.deleteMedicationLog(id, userId);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Finger Tapping routes
  app.post("/api/finger-tapping", isAuthenticated, async (req, res) => {
    try {
      const input = {
        hand: req.body.hand,
        avgInterval: req.body.avgInterval,
        stdDev: req.body.stdDev,
        tapsPerSecond: req.body.tapsPerSecond,
        regularityScore: req.body.regularityScore,
        asymmetryScore: req.body.asymmetryScore,
        rhythmStability: req.body.rhythmStability,
        totalTaps: req.body.totalTaps,
      };
      const user = req.user as any;
      const userId = user.claims.sub;
      const session = await storage.createFingerTappingSession({ userId, ...input });
      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to save finger tapping session";
      return res.status(500).json({ message });
    }
  });

  app.get("/api/finger-tapping", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;
    const sessions = await storage.getFingerTappingSessions(userId);
    res.json(sessions);
  });

  // Settings
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userId = user.claims.sub;
    const settings = await storage.getSettings(userId);
    res.json(settings || {});
  });

  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const settings = await storage.setSettings(userId, req.body);
      res.json(settings);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to save settings";
      return res.status(500).json({ message });
    }
  });

  // AI
  app.post("/api/ai/test", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const settings = await storage.getSettings(userId);

      // Default to google if not set in DB, or use DB setting
      const provider = settings?.aiProvider || "google";

      let apiKey = provider === "openai" ? settings?.openaiApiKey : settings?.googleAiApiKey;

      // Fallback to env
      if (!apiKey) {
        if (provider === "openai") apiKey = process.env.OPENAI_API_KEY;
        else apiKey = process.env.GOOGLE_AI_API_KEY;
      }

      if (!apiKey) {
        return res.status(400).json({ message: `${provider.toUpperCase()} API key not configured` });
      }

      if (provider === "openai") {
        const openaiRes = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!openaiRes.ok) throw new Error("Invalid OpenAI API key");
        res.json({ message: "OpenAI API key is valid" });
      } else {
        // Google AI test: call models endpoint
        const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!googleRes.ok) throw new Error("Invalid Google AI API key");
        res.json({ message: "Google AI API key is valid" });
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Test failed";
      return res.status(500).json({ message });
    }
  });

  app.post("/api/ai/insight", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const settings = await storage.getSettings(userId);


      // Determine provider and key with env fallback
      const provider = settings?.aiProvider || "google";
      let apiKey = provider === "openai" ? settings?.openaiApiKey : settings?.googleAiApiKey;

      console.log(`[AI Insight] Provider: ${provider}`);
      console.log(`[AI Insight] Key from settings present: ${!!apiKey}`);

      if (!apiKey) {
        if (provider === "openai") {
          apiKey = process.env.OPENAI_API_KEY;
          console.log(`[AI Insight] Falling back to OPENAI_API_KEY: ${!!apiKey}`);
        } else {
          apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
          console.log(`[AI Insight] Falling back to GOOGLE_AI_API_KEY/GEMINI_API_KEY: ${!!apiKey}`);
        }
      }

      if (!apiKey) {
        console.error(`[AI Insight] No API key found for ${provider}`);
        return res.status(400).json({ message: `${provider.toUpperCase()} API key not configured` });
      }

      const { sessions, meds, fingerTaps, customPrompt } = req.body;
      const prompt = customPrompt || settings?.customPrompt || "Summarize the patient’s motor symptom trends, medication effectiveness, and any notable patterns. Provide actionable insights in 2-3 sentences.";
      const context = `
Recent tremor sessions (${sessions.length}):
${sessions.slice(-3).map((s: any) => `- Severity: ${s.severityScore?.toFixed(1)} at ${new Date(s.timestamp).toLocaleString()}`).join("\n")}

Recent medications (${meds.length}):
${meds.slice(-3).map((m: any) => `- ${m.medicationName} ${m.dosage || ""} at ${new Date(m.timeTaken).toLocaleString()}`).join("\n")}

Recent finger tapping (${fingerTaps.length}):
${fingerTaps.slice(-3).map((f: any) => `- ${f.hand} hand: ${f.tapsPerSecond?.toFixed(1)} taps/s, regularity ${f.regularityScore?.toFixed(0)}% at ${new Date(f.timestamp).toLocaleString()}`).join("\n")}
      `.trim();

      let insight = "";
      if (provider === "openai") {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful clinical assistant summarizing Parkinson’s symptom data. Be concise and clear." },
              { role: "user", content: `${prompt}\n\n${context}` },
            ],
            max_tokens: 200,
          }),
        });
        if (!openaiRes.ok) throw new Error("OpenAI request failed");
        const openaiData = await openaiRes.json();
        insight = openaiData.choices?.[0]?.message?.content || "No insight generated.";
      } else {
        // Google AI (Gemini)
        const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are a helpful clinical assistant summarizing Parkinson’s symptom data. Be concise and clear.\n\n${prompt}\n\n${context}` }],
            }],
            generationConfig: { maxOutputTokens: 200 },
          }),
        });
        if (!googleRes.ok) {
          const errText = await googleRes.text();
          console.error("Google AI Error:", errText);
          throw new Error("Google AI request failed");
        }
        const googleData = await googleRes.json();
        insight = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "No insight generated.";
      }
      res.json({ insight });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to generate insight";
      return res.status(500).json({ message });
    }
  });

  app.post("/api/ai/speech-stabilize", isAuthenticated, async (req, res) => {
    try {
      const { audioData, text } = req.body;
      if (!audioData && !text) return res.status(400).json({ message: "No audio data or text provided" });

      const user = req.user as any;
      const userId = user.claims.sub;
      const settings = await storage.getSettings(userId);
      const provider = settings?.aiProvider || "google";
      let apiKey = provider === "openai" ? settings?.openaiApiKey : settings?.googleAiApiKey;

      if (!apiKey) {
        if (provider === "openai") apiKey = process.env.OPENAI_API_KEY;
        else apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
      }

      if (!apiKey) {
        return res.status(400).json({ message: "AI API key not configured" });
      }

      // We only support Gemini for multimodal (audio) for now
      // OpenAI's chat completions don't strictly support audio upload in this simple JSON format often, 
      // but Gemini 1.5 Flash is great for this. Enforce Gemini or warn user.

      let stabilizedText = "";

      if (audioData) {
        // Construct the request for Gemini 1.5 Flash (Audio)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "The following audio contains speech from a person with Parkinson's disease (dysarthria). Please listen carefully and provide a clear, stabilized transcript of what they are trying to say. Do not add commentary, just the corrected text." },
                {
                  inline_data: {
                    mime_type: "audio/webm", // Assuming frontend sends webm, or wav. simple-recorder usually webm
                    data: audioData // Base64 string
                  }
                }
              ]
            }]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Gemini Audio Error:", errText);
          throw new Error("Failed to process audio with AI");
        }
        const data = await response.json();
        stabilizedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not decode speech.";

      } else if (text) {
        // Text-based correction (Grammar/Clarity)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `The following text is a transcript of speech from a person with Parkinson's disease. It may contain stuttering, repetitions, or unclear phrasing. Please rewrite it to be clear, concise, and natural, while preserving the original meaning. Do not add commentary, just the stabilized text.\n\nOriginal: "${text}"` }]
            }]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Gemini Text Error:", errText);
          throw new Error("Failed to process text with AI");
        }
        const data = await response.json();
        stabilizedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not stabilize text.";
      }

      res.json({ stabilizedText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Speech stabilization failed" });
    }
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
