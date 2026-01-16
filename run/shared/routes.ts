import { z } from 'zod';
import { insertProjectSchema, projects, audits, vulnerabilities, reports } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
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

// ============================================
// API CONTRACT
// ============================================
export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect & { audits: typeof audits.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  audits: {
    create: {
      method: 'POST' as const,
      path: '/api/audits',
      input: z.object({ projectId: z.number() }),
      responses: {
        201: z.custom<typeof audits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/audits/:id',
      responses: {
        200: z.custom<typeof audits.$inferSelect & { vulnerabilities: typeof vulnerabilities.$inferSelect[], project: typeof projects.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  reports: {
    get: {
      method: 'GET' as const,
      path: '/api/audits/:id/report',
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
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
