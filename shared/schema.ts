import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

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

// === EXPLICIT API CONTRACT TYPES ===

export type HandwritingSession = typeof handwritingSessions.$inferSelect;
export type InsertHandwritingSession = z.infer<typeof insertHandwritingSessionSchema>;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;

// Request types
export type CreateSessionRequest = {
  points: Array<{ x: number, y: number, timestamp: number }>;
};

export type CreateMedicationLogRequest = {
  medicationName: string;
  dosage?: string;
  timeTaken?: string; // ISO string
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
