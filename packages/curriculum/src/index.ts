import { z } from 'zod';
export const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const version = z.string().regex(/^\d+\.\d+\.\d+$/);
export const locale = z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/);
export const trackSchema = z.object({
  id, version, locale, title:z.string().min(3), description:z.string().min(10),
  level:z.enum(['beginner','intermediate','advanced']),
  modules:z.array(z.object({id,required:z.boolean()})).min(1),
  completion:z.object({requireAllLessons:z.boolean(),requireCapstone:z.boolean(),credentialType:z.literal('completion')})
}).strict();
export const moduleSchema = z.object({id,trackId:id,title:z.string().min(3),description:z.string().min(10),position:z.number().int().nonnegative()}).strict();
export const lessonSchema = z.object({
 id,version,moduleId:id,slug:id,title:z.string().min(3),locale,
 estimatedMinutes:z.number().int().min(1).max(180),
 prerequisites:z.array(id),objectives:z.array(z.string().min(10)).min(1),
 exerciseIds:z.array(id),
 accessibility:z.object({requiresKeyboardAccess:z.boolean(),includesTextAlternative:z.boolean()}).strict(),
 references:z.array(z.string().url())
}).strict();
export const exerciseSchema = z.object({
 id,version,lessonId:id,engine:z.literal('html-css-js'),title:z.string().min(3),
 difficulty:z.enum(['beginner','intermediate','advanced']),starterFiles:z.array(z.string()).min(1),
 limits:z.object({maxSourceBytes:z.number().int().positive().max(100000),maxRuntimeMs:z.number().int().positive().max(5000)}).strict(),
 grading:z.object({mode:z.literal('client-formative'),passingScore:z.number().int().min(0).max(100),testsFile:z.string()}).strict()
}).strict();
export const assertionSchema=z.discriminatedUnion('assertion',[
 z.object({id,testType:z.literal('dom-query'),selector:z.string().min(1),assertion:z.literal('count-at-least'),expected:z.number().int().nonnegative(),weight:z.number().int().positive()}).strict(),
 z.object({id,testType:z.literal('dom-query'),selector:z.string().min(1),assertion:z.literal('count-exactly'),expected:z.number().int().nonnegative(),weight:z.number().int().positive()}).strict()
]);
export const testsSchema=z.object({version:z.literal(1),tests:z.array(assertionSchema).min(1).max(100)}).strict();
export type Track=z.infer<typeof trackSchema>;
export type Module=z.infer<typeof moduleSchema>;
export type Lesson=z.infer<typeof lessonSchema>;
export type Exercise=z.infer<typeof exerciseSchema>;
