import { z } from 'zod';
export const enrollSchema = z.object({ trackId: z.string().regex(/^[a-z0-9-]{1,120}$/) }).strict();
export const lessonProgressSchema = z.object({ contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/), status: z.literal('completed') }).strict();
export const submissionSchema = z.object({
 exerciseId: z.string().regex(/^[a-z0-9-]{1,120}$/),
 exerciseVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
 score: z.number().int().min(0).max(100), passed: z.boolean(),
 results: z.array(z.object({ testId: z.string().min(1).max(120), passed: z.boolean() }).strict()).max(100)
}).strict();
export type EnrollmentInput = z.infer<typeof enrollSchema>;
export type ProgressInput = z.infer<typeof lessonProgressSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ProgressStore = {
 profile(userId: string): Promise<unknown>;
 enroll(userId: string, input: EnrollmentInput): Promise<{ created: boolean; trackId: string }>;
 progress(userId: string): Promise<unknown>;
 completeLesson(userId: string, lessonId: string, input: ProgressInput): Promise<unknown>;
 submit(userId: string, input: SubmissionInput): Promise<unknown>;
};
