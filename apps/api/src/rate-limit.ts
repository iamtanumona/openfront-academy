import type { MiddlewareHandler } from 'hono';
export type RateLimitStore = { increment(key: string, windowMs: number): Promise<number> };
/** Local-only limiter. Use shared Redis/edge rate limiting for multi-instance production. */
export function memoryRateLimitStore(): RateLimitStore {
 const counts = new Map<string,{count:number; expires:number}>();
 return { async increment(key,windowMs) {
  const now=Date.now(); const old=counts.get(key);
  const entry=old && old.expires>now ? old : {count:0,expires:now+windowMs};
  entry.count++; counts.set(key,entry);
  if(counts.size>10000) for(const [k,v] of counts) if(v.expires<=now) counts.delete(k);
  return entry.count;
 }};
}
export function rateLimit(options:{store:RateLimitStore;limit:number;windowMs:number;key:(c:any)=>string}):MiddlewareHandler {
 return async (c,next)=>{
  const count=await options.store.increment(options.key(c),options.windowMs);
  c.header('X-RateLimit-Limit',String(options.limit));
  if(count>options.limit){c.header('Retry-After',String(Math.ceil(options.windowMs/1000)));return c.json({error:{code:'RATE_LIMITED',message:'Please retry later'}},429);}
  await next();
 };
}
