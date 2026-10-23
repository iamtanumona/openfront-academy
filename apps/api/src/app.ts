import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';
import { HealthResponseSchema, TrackSchema } from '@ofa/contracts';
import { requireAuth, type AuthVerifier } from './auth.js';
import { enrollSchema, lessonProgressSchema, submissionSchema, type ProgressStore } from './progress.js';
import { issueSchema, type CredentialStore } from './credentials.js';
import { DomainError } from './db/progress-store.js';
import { memoryRateLimitStore, rateLimit, type RateLimitStore } from './rate-limit.js';
import { requestObservability } from './observability.js';

export type Dependencies = {
 ping: () => Promise<void>;
 listTracks: () => Promise<unknown[]>;
 verifyToken?: AuthVerifier;
 progressStore?: ProgressStore;
 credentialStore?: CredentialStore;
 rateLimitStore?: RateLimitStore;
};
export function createApp(deps: Dependencies, webOrigin: string) {
 const app = new Hono();
 app.use('*', requestObservability());
 app.use('*', secureHeaders());
 const limiter=deps.rateLimitStore ?? memoryRateLimitStore();
 app.use('/v1/*',rateLimit({store:limiter,limit:120,windowMs:60_000,key:c=>'api:'+ (process.env.TRUST_CLOUDFLARE_IP==='true' ? (c.req.header('cf-connecting-ip') ?? 'unknown') : 'untrusted')}));
 app.use('/v1/submissions',rateLimit({store:limiter,limit:20,windowMs:60_000,key:c=>'submit:'+ (process.env.TRUST_CLOUDFLARE_IP==='true' ? (c.req.header('cf-connecting-ip') ?? 'unknown') : 'untrusted')}));
 app.use('/v1/certificates/issue',rateLimit({store:limiter,limit:5,windowMs:60_000,key:c=>'cert:'+ (process.env.TRUST_CLOUDFLARE_IP==='true' ? (c.req.header('cf-connecting-ip') ?? 'unknown') : 'untrusted')}));
 app.use('/v1/*', cors({ origin: webOrigin, allowMethods: ['GET','POST','PUT','OPTIONS'], allowHeaders: ['Authorization','Content-Type'] }));
 app.get('/v1/health/live', c => c.json(HealthResponseSchema.parse({ status:'ok', service:'openfront-api', version:'0.5.0' })));
 app.get('/v1/health/ready', async c => { try { await deps.ping(); return c.json({status:'ready'}); } catch {return c.json({status:'unavailable'},503);} });
 app.get('/v1/tracks', async c => { try {return c.json({data:z.array(TrackSchema).parse(await deps.listTracks())});} catch {return c.json({error:{code:'INTERNAL_ERROR',message:'Unable to load tracks'}},500);} });
 if (deps.verifyToken && deps.progressStore) {
  const store = deps.progressStore;
  app.use('/v1/me', requireAuth(deps.verifyToken));
  app.use('/v1/me/*', requireAuth(deps.verifyToken));
  app.use('/v1/submissions', requireAuth(deps.verifyToken));
  app.get('/v1/me', async c => c.json({data:await store.profile(c.get('userId'))}));
  app.get('/v1/me/progress', async c => c.json({data:await store.progress(c.get('userId'))}));
  app.post('/v1/me/enrollments', async c => {
   const parsed=enrollSchema.safeParse(await c.req.json().catch(()=>null));
   if(!parsed.success) return c.json({error:{code:'VALIDATION_ERROR',message:'Invalid enrollment'}},400);
   const result=await store.enroll(c.get('userId'),parsed.data);
   return c.json({data:result},result.created?201:200);
  });
  app.put('/v1/me/lessons/:lessonId/progress', async c => {
   const parsed=lessonProgressSchema.safeParse(await c.req.json().catch(()=>null));
   if(!parsed.success) return c.json({error:{code:'VALIDATION_ERROR',message:'Invalid progress'}},400);
   return c.json({data:await store.completeLesson(c.get('userId'),c.req.param('lessonId'),parsed.data)});
  });
  app.post('/v1/submissions', async c => {
   const parsed=submissionSchema.safeParse(await c.req.json().catch(()=>null));
   if(!parsed.success) return c.json({error:{code:'VALIDATION_ERROR',message:'Invalid submission'}},400);
   return c.json({data:await store.submit(c.get('userId'),parsed.data)},201);
  });
 }
 if(deps.credentialStore){
  const credentials=deps.credentialStore;
  app.get('/v1/credentials/keys',c=>c.json({data:credentials.publicKeys()}));
  app.get('/v1/certificates/:id/verify',async c=>{
   const id=c.req.param('id');if(!z.string().uuid().safeParse(id).success)return c.json({error:{code:'VALIDATION_ERROR',message:'Invalid certificate ID'}},400);
   const result=await credentials.verify(id);
   return result?c.json({data:result}):c.json({error:{code:'NOT_FOUND',message:'Certificate not found'}},404);
  });
  if(deps.verifyToken){
   app.use('/v1/certificates/issue',requireAuth(deps.verifyToken));
   app.get('/v1/me/certificates',requireAuth(deps.verifyToken),async c=>c.json({data:await credentials.list(c.get('userId'))}));
   app.post('/v1/certificates/issue',async c=>{
    const parsed=issueSchema.safeParse(await c.req.json().catch(()=>null));
    if(!parsed.success)return c.json({error:{code:'VALIDATION_ERROR',message:'Invalid certificate request'}},400);
    const result=await credentials.issue(c.get('userId'),parsed.data);
    return c.json({data:result},(result as {created:boolean}).created?201:200);
   });
  }
 }
 app.notFound(c => c.json({error:{code:'NOT_FOUND',message:'Not found'}},404));
 app.onError((err,c)=>{
  if(err instanceof DomainError) return c.json({error:{code:err.code,message:err.message}},err.status);
  console.error('API error:',err.message);
  return c.json({error:{code:'INTERNAL_ERROR',message:'Unexpected server error'}},500);
 });
 return app;
}
