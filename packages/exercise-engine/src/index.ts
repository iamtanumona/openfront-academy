import { z } from 'zod';
export const testSchema = z.discriminatedUnion('assertion', [
 z.object({id:z.string().min(1),testType:z.literal('dom-query'),selector:z.string().min(1),assertion:z.literal('count-at-least'),expected:z.number().int().nonnegative(),weight:z.number().int().positive()}).strict(),
 z.object({id:z.string().min(1),testType:z.literal('dom-query'),selector:z.string().min(1),assertion:z.literal('count-exactly'),expected:z.number().int().nonnegative(),weight:z.number().int().positive()}).strict()
]);
export const suiteSchema = z.object({version:z.literal(1),tests:z.array(testSchema).min(1).max(100)}).strict();
export type Suite = z.infer<typeof suiteSchema>;
export const resultSchema = z.object({type:z.literal('OFA_RESULT'),requestId:z.string().uuid(),nonce:z.string().min(16),results:z.array(z.object({testId:z.string(),passed:z.boolean(),actual:z.number().int().nonnegative()}).strict()).max(100),error:z.string().optional()}).strict();
export type Result = z.infer<typeof resultSchema>;
export function grade(suite:Suite, results:Result['results']) {
 const byId=new Map(results.map(r=>[r.testId,r]));
 const max=suite.tests.reduce((n,t)=>n+t.weight,0);
 const earned=suite.tests.reduce((n,t)=>n+(byId.get(t.id)?.passed?t.weight:0),0);
 return {score:Math.round(100*earned/max),passed:earned===max,results:suite.tests.map(t=>({...byId.get(t.id),testId:t.id,passed:byId.get(t.id)?.passed===true}))};
}
export function safeJson(value:unknown):string {return JSON.stringify(value).replace(/</g,'\u003c').replace(/>/g,'\u003e').replace(/&/g,'\u0026').replace(/\u2028/g,'\u2028').replace(/\u2029/g,'\u2029');}
export function validateFiles(files:{html:string,css:string,javascript:string},maxBytes:number){
 const size=new TextEncoder().encode(files.html+files.css+files.javascript).length;
 if(size>maxBytes)throw new Error(`Source exceeds ${maxBytes} bytes`);
 return size;
}
