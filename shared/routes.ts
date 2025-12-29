import { z } from 'zod';
import { insertHandwritingSessionSchema, insertMedicationLogSchema, handwritingSessions, medicationLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  sessions: {
    create: {
      method: 'POST' as const,
      path: '/api/sessions',
      input: z.object({
        points: z.array(z.object({
          x: z.number(),
          y: z.number(),
          timestamp: z.number()
        }))
      }),
      responses: {
        201: z.custom<typeof handwritingSessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sessions',
      responses: {
        200: z.array(z.custom<typeof handwritingSessions.$inferSelect>()),
      },
    },
  },
  medications: {
    create: {
      method: 'POST' as const,
      path: '/api/medications',
      input: z.object({
        medicationName: z.string(),
        dosage: z.string().optional(),
        timeTaken: z.string().optional(), // ISO string
      }),
      responses: {
        201: z.custom<typeof medicationLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/medications',
      responses: {
        200: z.array(z.custom<typeof medicationLogs.$inferSelect>()),
      },
    },
  },
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
      responses: {
        200: z.object({
          currentMedicationState: z.enum(["ON", "WEARING_OFF", "OFF"]),
          timeSinceLastDoseMinutes: z.number(),
          tremorTrend: z.enum(["Improving", "Stable", "Worsening"]),
          averageTremorScore: z.number(),
          bestPostMedicationScore: z.number(),
          medicationEffectivenessScore: z.number(),
          insight: z.string(),
          trendTimeline: z.array(z.object({
            timestamp: z.number(),
            tremorScore: z.number(),
            medicationState: z.string(),
          })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
