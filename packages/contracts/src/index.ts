import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('openfront-api'),
  version: z.string(),
});

export const TrackSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  curriculumVersion: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type Track = z.infer<typeof TrackSchema>;
