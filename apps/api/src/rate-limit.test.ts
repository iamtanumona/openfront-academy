import { describe,it,expect } from 'vitest';
import { Hono } from 'hono';
import { memoryRateLimitStore,rateLimit } from './rate-limit.js';
describe('rate limiting',()=>{
 it('rejects requests exceeding the window',async()=>{
  const app=new Hono();app.use('*',rateLimit({store:memoryRateLimitStore(),limit:2,windowMs:60000,key:()=> 'same-client'}));
  app.get('/',c=>c.text('ok'));
  expect((await app.request('/')).status).toBe(200);
  expect((await app.request('/')).status).toBe(200);
  const denied=await app.request('/');expect(denied.status).toBe(429);
  expect(denied.headers.get('Retry-After')).toBe('60');
 });
});
