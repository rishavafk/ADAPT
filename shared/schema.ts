import { pgTable, text, serial, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const handwritingSessions = pgTable("handwriting_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to auth user manually handled as string
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  points: jsonb("points").notNull(), // Array<{x, y, timestamp}>
  tremorAmplitude: doublePrecision("tremor_amplitude"),
  jitter: doublePrecision("jitter"),
  estimatedFrequency: doublePrecision("estimated_frequency"),
  severityScore: doublePrecision("severity_score"),
  tremorState: text("tremor_state"), // "Stable" | "Moderate" | "Severe"
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage"),
  timeTaken: timestamp("time_taken").defaultNow().notNull(),
});

export const fingerTappingSessions = pgTable("finger_tapping_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  hand: text("hand").notNull(), // "left" | "right"
  avgInterval: doublePrecision("avg_interval"),
  stdDev: doublePrecision("std_dev"),
  tapsPerSecond: doublePrecision("taps_per_second"),
  regularityScore: doublePrecision("regularity_score"),
  asymmetryScore: doublePrecision("asymmetry_score"),
  rhythmStability: doublePrecision("rhythm_stability"),
  totalTaps: doublePrecision("total_taps").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  openaiApiKey: text("openai_api_key"),
  googleAiApiKey: text("google_ai_api_key"),
  aiProvider: text("ai_provider", { enum: ["openai", "google"] }).default("openai"),
  aiEnabled: text("ai_enabled", { enum: ["true", "false"] }).default("false"),
  customPrompt: text("custom_prompt"),
});

// === RELATIONS ===
// (Optional: define relations if using drizzle query builder with relations)

// === BASE SCHEMAS ===
export const insertHandwritingSessionSchema = createInsertSchema(handwritingSessions).omit({ 
  id: true, 
  timestamp: true,
  tremorAmplitude: true,
  jitter: true,
  estimatedFrequency: true,
  severityScore: true,
  tremorState: true
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({ 
  id: true,
  // timeTaken is optional in input, defaults to now if not provided, but we might want to allow backdating
});

export const insertFingerTappingSessionSchema = createInsertSchema(fingerTappingSessions).omit({ 
  id: true,
  timestamp: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ 
  id: true,
});

// === EXPLICIT API CONTRACT TYPES ===

export type HandwritingSession = typeof handwritingSessions.$inferSelect;
export type InsertHandwritingSession = z.infer<typeof insertHandwritingSessionSchema>;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;

export type FingerTappingSession = typeof fingerTappingSessions.$inferSelect;
export type InsertFingerTappingSession = z.infer<typeof insertFingerTappingSessionSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

// Request types
export type CreateSessionRequest = {
  points: Array<{ x: number, y: number, timestamp: number }>;
};

export type CreateMedicationLogRequest = {
  medicationName: string;
  dosage?: string;
  timeTaken?: string; // ISO string
};

export type CreateFingerTappingSessionRequest = {
  hand: "left" | "right";
  avgInterval: number;
  stdDev: number;
  tapsPerSecond: number;
  regularityScore: number;
  asymmetryScore: number;
  rhythmStability: number;
  totalTaps: number;
};

// Response types
export type AnalysisResult = {
  timestamp: number;
  tremorAmplitude: number;
  jitter: number;
  estimatedFrequency: number;
  severityScore: number;
  tremorState: "Stable" | "Moderate" | "Severe";
};

export type DashboardStats = {
  currentMedicationState: "ON" | "WEARING_OFF" | "OFF";
  timeSinceLastDoseMinutes: number;
  tremorTrend: "Improving" | "Stable" | "Worsening";
  averageTremorScore: number;
  bestPostMedicationScore: number;
  medicationEffectivenessScore: number; // 0-100
  insight: string;
  trendTimeline: Array<{
    timestamp: number;
    tremorScore: number;
    medicationState: string;
  }>;
};
