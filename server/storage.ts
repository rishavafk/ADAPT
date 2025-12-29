import { db } from "./db";
import {
  handwritingSessions,
  medicationLogs,
  fingerTappingSessions,
  userSettings,
  type HandwritingSession,
  type InsertHandwritingSession,
  type MedicationLog,
  type InsertMedicationLog,
  type FingerTappingSession,
  type InsertFingerTappingSession,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { eq, desc, eq as drizzleEq, and } from "drizzle-orm";

export interface IStorage {
  // Handwriting Sessions
  createSession(session: InsertHandwritingSession & {
    tremorAmplitude: number,
    jitter: number,
    estimatedFrequency: number,
    severityScore: number,
    tremorState: string
  }): Promise<HandwritingSession>;
  getSessions(userId: string): Promise<HandwritingSession[]>;

  // Medication Logs
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationLogs(userId: string): Promise<MedicationLog[]>;
  deleteMedicationLog(id: number, userId: string): Promise<void>;
  getLastMedication(userId: string): Promise<MedicationLog | undefined>;

  // Finger Tapping Sessions
  createFingerTappingSession(session: InsertFingerTappingSession): Promise<FingerTappingSession>;
  getFingerTappingSessions(userId: string): Promise<FingerTappingSession[]>;

  // Settings
  getSettings(userId: string): Promise<UserSettings | undefined>;
  setSettings(userId: string, settings: InsertUserSettings): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  async createSession(session: InsertHandwritingSession & {
    tremorAmplitude: number,
    jitter: number,
    estimatedFrequency: number,
    severityScore: number,
    tremorState: string
  }): Promise<HandwritingSession> {
    const [newSession] = await db
      .insert(handwritingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSessions(userId: string): Promise<HandwritingSession[]> {
    return await db
      .select()
      .from(handwritingSessions)
      .where(eq(handwritingSessions.userId, userId))
      .orderBy(desc(handwritingSessions.timestamp));
  }

  async createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
    const [newLog] = await db
      .insert(medicationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getMedicationLogs(userId: string): Promise<MedicationLog[]> {
    return await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.userId, userId))
      .orderBy(desc(medicationLogs.timeTaken));
  }

  async deleteMedicationLog(id: number, userId: string): Promise<void> {
    await db
      .delete(medicationLogs)
      .where(
        and(
          drizzleEq(medicationLogs.id, id),
          drizzleEq(medicationLogs.userId, userId)
        )
      );
  }

  async getLastMedication(userId: string): Promise<MedicationLog | undefined> {
    const [log] = await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.userId, userId))
      .orderBy(desc(medicationLogs.timeTaken))
      .limit(1);
    return log;
  }

  async createFingerTappingSession(session: InsertFingerTappingSession): Promise<FingerTappingSession> {
    const [newSession] = await db
      .insert(fingerTappingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getFingerTappingSessions(userId: string): Promise<FingerTappingSession[]> {
    return await db
      .select()
      .from(fingerTappingSessions)
      .where(eq(fingerTappingSessions.userId, userId))
      .orderBy(desc(fingerTappingSessions.timestamp));
  }

  async getSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return settings;
  }

  async setSettings(userId: string, settings: InsertUserSettings): Promise<UserSettings> {
    const { openaiApiKey, googleAiApiKey, aiProvider, aiEnabled, customPrompt } = settings;
    const [newSettings] = await db
      .insert(userSettings)
      .values({ userId, openaiApiKey, googleAiApiKey, aiProvider, aiEnabled, customPrompt })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { openaiApiKey, googleAiApiKey, aiProvider, aiEnabled, customPrompt },
      })
      .returning();
    return newSettings;
  }
}

export const storage = new DatabaseStorage();
