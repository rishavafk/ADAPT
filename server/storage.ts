import { db } from "./db";
import {
  handwritingSessions,
  medicationLogs,
  type HandwritingSession,
  type InsertHandwritingSession,
  type MedicationLog,
  type InsertMedicationLog,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage, IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
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
  getLastMedication(userId: string): Promise<MedicationLog | undefined>;
}

export class DatabaseStorage extends (authStorage.constructor as { new (): IAuthStorage }) implements IStorage {
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

  async getLastMedication(userId: string): Promise<MedicationLog | undefined> {
    const [log] = await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.userId, userId))
      .orderBy(desc(medicationLogs.timeTaken))
      .limit(1);
    return log;
  }
}

export const storage = new DatabaseStorage();
